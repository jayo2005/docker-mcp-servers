#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import xmlrpc from 'xmlrpc';

const ODOO_URL = process.env.ODOO_URL || 'http://localhost:8069';
const ODOO_DB = process.env.ODOO_DB || 'odoo';
const ODOO_USER = process.env.ODOO_USER || 'admin';
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || 'admin';

class OdooMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'odoo16-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.uid = null;
  }

  async authenticate() {
    const commonClient = xmlrpc.createClient({
      url: `${ODOO_URL}/xmlrpc/2/common`,
      headers: {
        'User-Agent': 'NodeJS XML-RPC Client',
        'Content-Type': 'text/xml',
      },
    });

    return new Promise((resolve, reject) => {
      commonClient.methodCall(
        'authenticate',
        [ODOO_DB, ODOO_USER, ODOO_PASSWORD, {}],
        (error, value) => {
          if (error) {
            reject(error);
          } else {
            this.uid = value;
            resolve(value);
          }
        }
      );
    });
  }

  async execute(model, method, args) {
    if (!this.uid) {
      await this.authenticate();
    }

    const objectClient = xmlrpc.createClient({
      url: `${ODOO_URL}/xmlrpc/2/object`,
      headers: {
        'User-Agent': 'NodeJS XML-RPC Client',
        'Content-Type': 'text/xml',
      },
    });

    return new Promise((resolve, reject) => {
      objectClient.methodCall(
        'execute_kw',
        [ODOO_DB, this.uid, ODOO_PASSWORD, model, method, args],
        (error, value) => {
          if (error) {
            reject(error);
          } else {
            resolve(value);
          }
        }
      );
    });
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_read',
          description: 'Search and read records from Odoo',
          inputSchema: {
            type: 'object',
            properties: {
              model: {
                type: 'string',
                description: 'The Odoo model name (e.g., res.partner, sale.order)',
              },
              domain: {
                type: 'array',
                description: 'Search domain (e.g., [[\'customer_rank\', \'>\', 0]])',
                default: [],
              },
              fields: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of fields to return',
                default: [],
              },
              limit: {
                type: 'number',
                description: 'Maximum number of records to return',
                default: 80,
              },
              offset: {
                type: 'number',
                description: 'Number of records to skip',
                default: 0,
              },
            },
            required: ['model'],
          },
        },
        {
          name: 'create',
          description: 'Create a new record in Odoo',
          inputSchema: {
            type: 'object',
            properties: {
              model: {
                type: 'string',
                description: 'The Odoo model name',
              },
              values: {
                type: 'object',
                description: 'Field values for the new record',
              },
            },
            required: ['model', 'values'],
          },
        },
        {
          name: 'write',
          description: 'Update existing records in Odoo',
          inputSchema: {
            type: 'object',
            properties: {
              model: {
                type: 'string',
                description: 'The Odoo model name',
              },
              ids: {
                type: 'array',
                items: { type: 'number' },
                description: 'IDs of records to update',
              },
              values: {
                type: 'object',
                description: 'Field values to update',
              },
            },
            required: ['model', 'ids', 'values'],
          },
        },
        {
          name: 'unlink',
          description: 'Delete records from Odoo',
          inputSchema: {
            type: 'object',
            properties: {
              model: {
                type: 'string',
                description: 'The Odoo model name',
              },
              ids: {
                type: 'array',
                items: { type: 'number' },
                description: 'IDs of records to delete',
              },
            },
            required: ['model', 'ids'],
          },
        },
        {
          name: 'fields_get',
          description: 'Get field definitions for a model',
          inputSchema: {
            type: 'object',
            properties: {
              model: {
                type: 'string',
                description: 'The Odoo model name',
              },
              allfields: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific fields to get info for (empty for all)',
                default: [],
              },
            },
            required: ['model'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result;

        switch (name) {
          case 'search_read':
            result = await this.execute(
              args.model,
              'search_read',
              [args.domain || [], args.fields || [], args.offset || 0, args.limit || 80]
            );
            break;

          case 'create':
            result = await this.execute(args.model, 'create', [args.values]);
            break;

          case 'write':
            result = await this.execute(args.model, 'write', [args.ids, args.values]);
            break;

          case 'unlink':
            result = await this.execute(args.model, 'unlink', [args.ids]);
            break;

          case 'fields_get':
            result = await this.execute(
              args.model,
              'fields_get',
              [args.allfields || [], { attributes: ['string', 'help', 'type', 'required'] }]
            );
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Odoo16 MCP Server running...');
  }
}

const server = new OdooMCPServer();
server.run().catch(console.error);