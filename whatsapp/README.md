# WhatsApp Cloud API MCP Server
Test api form Meta = EAAM3pQurzVEBOZBKs8xoCwm8sXTcQRHyOZCLaUJnv1MuBwPIRbwuLSszK8GBrHM5CZBCGM39jqyz0ns3cQa0fqIprVWErkhX1tRsOeZCrLHGD6mj7UazZC1VRzmkb0mRd0uFxUfrrPFKZBumowyV2B5LxdjBEo42qZAqYqWLsNmNC83CgHB4PYCFIqJ0cZBGEgZCZAWvZCxIJ4XsaZCLcJTHzTx9GV8F0CZBrodxlfw6M
This MCP server provides integration with WhatsApp Cloud API, enabling automated messaging, media handling, and webhook management for WhatsApp Business accounts.

## Features

- **Send Text Messages** - Send WhatsApp messages with optional URL preview
- **Send Template Messages** - Use pre-approved templates for marketing/utility messages
- **Send Media** - Share images, videos, documents, and audio files
- **Template Management** - Create and list message templates
- **Webhook Configuration** - Set up webhooks to receive incoming messages
- **Message Status** - Mark received messages as read
- **Phone Number Management** - List and manage business phone numbers

## Prerequisites

1. **Meta Developer Account**: Create at https://developers.facebook.com
2. **WhatsApp Business App**: Set up in Meta Developer Console
3. **Business Verification**: Required for higher messaging limits

## Setup Instructions

### 1. Get WhatsApp Cloud API Credentials

1. Go to [Meta Developer Console](https://developers.facebook.com)
2. Create a new app or select existing
3. Add WhatsApp product to your app
4. From WhatsApp > API Setup, obtain:
   - **Access Token** (System User Token recommended for production)
   - **Phone Number ID** (from test number or your verified number)
   - **WhatsApp Business Account ID**

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# WhatsApp Cloud API Configuration
WHATSAPP_ACCESS_TOKEN=your-access-token-here
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token
WHATSAPP_WEBHOOK_URL=https://your-domain.com/webhook/whatsapp
```

### 3. Register with Claude Code

```bash
claude mcp add whatsapp /home/jason/MCP_SERVERS/scripts/mcp-whatsapp.sh
```

## Available Tools

### send_message
Send a text message to a WhatsApp user.

**Parameters:**
- `to` (string, required): Recipient phone number with country code (e.g., 353851234567)
- `message` (string, required): Text message to send
- `preview_url` (boolean, optional): Enable URL preview (default: false)

**Example:**
```json
{
  "to": "353851234567",
  "message": "Hello! Thanks for contacting support.",
  "preview_url": true
}
```

### send_template
Send a pre-approved template message.

**Parameters:**
- `to` (string, required): Recipient phone number
- `template_name` (string, required): Name of approved template
- `language_code` (string, optional): Language code (default: "en_US")
- `components` (array, optional): Template components for variables

### send_media
Send media files (images, videos, documents, audio).

**Parameters:**
- `to` (string, required): Recipient phone number
- `media_type` (string, required): One of: "image", "video", "document", "audio"
- `media_url` (string, required): Public URL of media file
- `caption` (string, optional): Caption for media
- `filename` (string, optional): Filename for documents

### get_message_templates
List all approved message templates.

**Parameters:**
- `limit` (number, optional): Number of templates to retrieve (default: 20)

### create_template
Create a new message template for approval.

**Parameters:**
- `name` (string, required): Template name
- `category` (string, required): One of: "AUTHENTICATION", "MARKETING", "UTILITY"
- `language` (string, optional): Language code (default: "en_US")
- `components` (array, required): Template components (header, body, footer, buttons)

### get_webhook_info
Get webhook configuration details for receiving messages.

### mark_as_read
Mark a received message as read.

**Parameters:**
- `message_id` (string, required): WhatsApp message ID

### get_phone_numbers
List WhatsApp Business phone numbers.

## Webhook Setup for Receiving Messages

To receive incoming messages (including photos for ticket creation):

1. Use `get_webhook_info` tool to get your webhook URL and verify token
2. In Meta Developer Console:
   - Go to WhatsApp > Configuration
   - Set Callback URL from webhook info
   - Set Verify Token from webhook info
   - Subscribe to webhook fields: `messages`, `message_status`

## Use Cases

### Support Groups
- Customers can initiate conversations (FREE unlimited service conversations)
- Automatically acknowledge messages
- Receive photos and create support tickets

### Photo to Ticket Workflow
1. Customer sends photo via WhatsApp
2. Webhook receives message with media URL
3. Download photo and create ticket in Odoo
4. Send confirmation message to customer

### Marketing Campaigns
- Use template messages for promotional content
- Send product catalogs as documents
- Share video demonstrations

## Pricing (as of Nov 2024)

- **Service Conversations**: FREE (unlimited when customer initiates)
- **Marketing Messages**: Paid (varies by country)
- **Utility Messages**: Paid (lower rates than marketing)
- **Template Messages**: Will be charged per message from July 2025

## Rate Limits

- **Unverified**: 250 unique users per 24 hours
- **Verified Business**: 1,000+ messages per day
- **API Calls**: 200 requests per hour per phone number

## Best Practices

1. **Always respond within 24 hours** to maintain free service conversation window
2. **Use templates** for business-initiated conversations
3. **Store message IDs** for tracking and marking as read
4. **Implement proper error handling** for API failures
5. **Monitor webhook delivery** for reliable message receipt

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check access token validity
2. **Rate Limit Exceeded**: Implement exponential backoff
3. **Template Not Found**: Ensure template is approved
4. **Media Upload Failed**: Verify media URL is publicly accessible

### Debug Mode

Check container logs:
```bash
docker logs mcp-whatsapp
```

## Additional Resources

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Webhook Setup Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Pricing Information](https://developers.facebook.com/docs/whatsapp/pricing)

## Support

For issues specific to this MCP server, check:
- Server logs: `docker logs mcp-whatsapp`
- Test script: `./test-servers.sh`
- Environment variables in `.env`

For WhatsApp API issues, contact Meta Business Support.