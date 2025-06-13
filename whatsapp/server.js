import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class WhatsAppMCPServer {
  constructor() {
    this.server = new Server({
      name: 'whatsapp-cloud-api',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.setupTools();
    
    // WhatsApp Cloud API Configuration
    this.baseURL = 'https://graph.facebook.com/v18.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'mcp_webhook_verify_token';
  }

  setupTools() {
    // Set up tools list handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'send_message',
          description: 'Send a WhatsApp message to a phone number',
          inputSchema: {
            type: 'object',
            properties: {
              to: { type: 'string', description: 'Recipient phone number with country code (e.g., 353851234567)' },
              message: { type: 'string', description: 'Text message to send' },
              preview_url: { type: 'boolean', description: 'Enable URL preview', default: false }
            },
            required: ['to', 'message']
          }
        },
        {
          name: 'send_template',
          description: 'Send a WhatsApp template message',
          inputSchema: {
            type: 'object',
            properties: {
              to: { type: 'string', description: 'Recipient phone number with country code' },
              template_name: { type: 'string', description: 'Template name' },
              language_code: { type: 'string', description: 'Language code (e.g., en_US)', default: 'en_US' },
              components: { type: 'array', description: 'Template components', default: [] }
            },
            required: ['to', 'template_name']
          }
        },
        {
          name: 'send_media',
          description: 'Send media (image, video, document) via WhatsApp',
          inputSchema: {
            type: 'object',
            properties: {
              to: { type: 'string', description: 'Recipient phone number with country code' },
              media_type: { type: 'string', enum: ['image', 'video', 'document', 'audio'], description: 'Type of media' },
              media_url: { type: 'string', description: 'URL of the media file' },
              caption: { type: 'string', description: 'Caption for the media' },
              filename: { type: 'string', description: 'Filename (for documents)' }
            },
            required: ['to', 'media_type', 'media_url']
          }
        },
        {
          name: 'get_message_templates',
          description: 'Get list of approved WhatsApp message templates',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', description: 'Number of templates to retrieve', default: 20 }
            }
          }
        },
        {
          name: 'create_template',
          description: 'Create a new WhatsApp message template',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Template name' },
              category: { type: 'string', enum: ['AUTHENTICATION', 'MARKETING', 'UTILITY'], description: 'Template category' },
              language: { type: 'string', description: 'Language code', default: 'en_US' },
              components: { type: 'array', description: 'Template components (header, body, footer, buttons)' }
            },
            required: ['name', 'category', 'components']
          }
        },
        {
          name: 'get_webhook_info',
          description: 'Get webhook configuration information for receiving messages',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'mark_as_read',
          description: 'Mark a received message as read',
          inputSchema: {
            type: 'object',
            properties: {
              message_id: { type: 'string', description: 'WhatsApp message ID to mark as read' }
            },
            required: ['message_id']
          }
        },
        {
          name: 'get_phone_numbers',
          description: 'Get list of WhatsApp phone numbers for the business account',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'send_message':
            return await this.sendMessage(args);
          case 'send_template':
            return await this.sendTemplate(args);
          case 'send_media':
            return await this.sendMedia(args);
          case 'get_message_templates':
            return await this.getMessageTemplates(args);
          case 'create_template':
            return await this.createTemplate(args);
          case 'get_webhook_info':
            return await this.getWebhookInfo();
          case 'mark_as_read':
            return await this.markAsRead(args);
          case 'get_phone_numbers':
            return await this.getPhoneNumbers();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}\n${error.response?.data ? JSON.stringify(error.response.data, null, 2) : ''}`
          }],
          isError: true
        };
      }
    });
  }

  async sendMessage({ to, message, preview_url = false }) {
    const response = await axios.post(
      `${this.baseURL}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: preview_url,
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: [{
        type: 'text',
        text: `Message sent successfully!\nMessage ID: ${response.data.messages[0].id}\nTo: ${to}`
      }]
    };
  }

  async sendTemplate({ to, template_name, language_code = 'en_US', components = [] }) {
    const response = await axios.post(
      `${this.baseURL}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: template_name,
          language: {
            code: language_code
          },
          components: components
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: [{
        type: 'text',
        text: `Template message sent successfully!\nMessage ID: ${response.data.messages[0].id}\nTemplate: ${template_name}\nTo: ${to}`
      }]
    };
  }

  async sendMedia({ to, media_type, media_url, caption, filename }) {
    const mediaObject = {
      link: media_url
    };
    
    if (caption) {
      mediaObject.caption = caption;
    }
    
    if (filename && media_type === 'document') {
      mediaObject.filename = filename;
    }

    const response = await axios.post(
      `${this.baseURL}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: media_type,
        [media_type]: mediaObject
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: [{
        type: 'text',
        text: `${media_type} sent successfully!\nMessage ID: ${response.data.messages[0].id}\nTo: ${to}`
      }]
    };
  }

  async getMessageTemplates({ limit = 20 }) {
    const response = await axios.get(
      `${this.baseURL}/${this.businessAccountId}/message_templates?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    const templates = response.data.data.map(template => ({
      name: template.name,
      status: template.status,
      category: template.category,
      language: template.language,
      components: template.components
    }));

    return {
      content: [{
        type: 'text',
        text: `Found ${templates.length} templates:\n\n${JSON.stringify(templates, null, 2)}`
      }]
    };
  }

  async createTemplate({ name, category, language = 'en_US', components }) {
    const response = await axios.post(
      `${this.baseURL}/${this.businessAccountId}/message_templates`,
      {
        name: name,
        category: category,
        language: language,
        components: components
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: [{
        type: 'text',
        text: `Template created successfully!\nTemplate ID: ${response.data.id}\nName: ${name}\nStatus: ${response.data.status}`
      }]
    };
  }

  async getWebhookInfo() {
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL || 'https://your-domain.com/webhook/whatsapp';
    
    return {
      content: [{
        type: 'text',
        text: `WhatsApp Webhook Configuration:
        
1. Webhook URL: ${webhookUrl}
2. Webhook Verify Token: ${this.webhookVerifyToken}

To receive messages, configure these in Meta Developer Console:
- Go to your app dashboard
- Navigate to WhatsApp > Configuration
- Set Callback URL: ${webhookUrl}
- Set Verify Token: ${this.webhookVerifyToken}
- Subscribe to webhook fields: messages, message_status

For incoming messages with photos to create Odoo tickets:
- Messages will be received at your webhook endpoint
- Media URLs will be included in the webhook payload
- Process the webhook to create tickets in Odoo`
      }]
    };
  }

  async markAsRead({ message_id }) {
    const response = await axios.post(
      `${this.baseURL}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: message_id
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: [{
        type: 'text',
        text: `Message marked as read!\nMessage ID: ${message_id}`
      }]
    };
  }

  async getPhoneNumbers() {
    const response = await axios.get(
      `${this.baseURL}/${this.businessAccountId}/phone_numbers`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    const numbers = response.data.data.map(phone => ({
      id: phone.id,
      display_phone_number: phone.display_phone_number,
      verified_name: phone.verified_name,
      quality_rating: phone.quality_rating
    }));

    return {
      content: [{
        type: 'text',
        text: `WhatsApp Business Phone Numbers:\n\n${JSON.stringify(numbers, null, 2)}`
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('WhatsApp Cloud API MCP server running...');
  }
}

const server = new WhatsAppMCPServer();
server.run().catch(console.error);