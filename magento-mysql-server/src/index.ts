#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: 'port.softcroft.ie',
  port: 40000,
  database: 'a35dda22_mage2',
  user: process.env.MAGENTO_DB_USER,
  password: process.env.MAGENTO_DB_PASSWORD,
};

class MagentoMySQLServer {
  private server: Server;
  private pool: mysql.Pool;

  constructor() {
    this.server = new Server(
      {
        name: 'magento-mysql-server',
        version: '0.1.0',
        description: 'MCP server for interacting with Magento MySQL database.',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.pool = mysql.createPool(DB_CONFIG);

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.pool.end();
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_colour_categories',
          description: 'Get all colour categories',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of records to return',
              },
            },
            required: [],
          },
        },
        {
          name: 'get_colour_products',
          description: 'Get all colour products',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of records to return',
              },
            },
            required: [],
          },
        },
        {
          name: 'get_colour_ranges',
          description: 'Get all colour ranges',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of records to return',
              },
            },
            required: [],
          },
        },
        {
          name: 'get_product_management',
          description: 'Get product management data',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of records to return',
              },
            },
            required: [],
          },
        },
        {
          name: 'get_product_assignments',
          description: 'Get product assignments',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of records to return',
              },
            },
            required: [],
          },
        },
        {
          name: 'execute_query',
          description: 'Execute a custom SQL query',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'SQL query to execute',
              },
              params: {
                type: 'array',
                description: 'Query parameters',
                items: {
                  type: ['string', 'number', 'boolean', 'null'],
                },
              },
            },
            required: ['query'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_colour_categories': {
            const limit = (request.params.arguments as any)?.limit;
            const query = 'SELECT * FROM srp_paintcolour_colour_category' + 
              (limit ? ' LIMIT ?' : '');
            const [rows] = await this.pool.execute(query, limit ? [limit] : []);
            return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
          }

          case 'get_colour_products': {
            const limit = (request.params.arguments as any)?.limit;
            const query = `
              SELECT cp.*, cpe.sku, cpev.value as product_name
              FROM srp_paintcolour_category_product cp
              LEFT JOIN catalog_product_entity cpe ON cp.product_id = cpe.entity_id
              LEFT JOIN catalog_product_entity_varchar cpev ON cpe.entity_id = cpev.entity_id
              WHERE cpev.attribute_id = 73
              ${limit ? 'LIMIT ?' : ''}
            `;
            const [rows] = await this.pool.execute(query, limit ? [limit] : []);
            return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
          }

          case 'get_colour_ranges': {
            const limit = (request.params.arguments as any)?.limit;
            const query = 'SELECT * FROM srp_paintcolour_colour_range' + 
              (limit ? ' LIMIT ?' : '');
            const [rows] = await this.pool.execute(query, limit ? [limit] : []);
            return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
          }

          case 'get_product_management': {
            const limit = (request.params.arguments as any)?.limit;
            const query = 'SELECT * FROM srp_paintcolour_product_management' + 
              (limit ? ' LIMIT ?' : '');
            const [rows] = await this.pool.execute(query, limit ? [limit] : []);
            return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
          }

          case 'get_product_assignments': {
            const limit = (request.params.arguments as any)?.limit;
            const query = 'SELECT * FROM srp_product_assign' + 
              (limit ? ' LIMIT ?' : '');
            const [rows] = await this.pool.execute(query, limit ? [limit] : []);
            return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
          }

          case 'execute_query': {
            const { query, params = [] } = request.params.arguments as { 
              query: string;
              params?: (string | number | boolean | null)[];
            };
            const [rows] = await this.pool.execute(query, params);
            return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) throw error;
        throw new McpError(
          ErrorCode.InternalError,
          `Database error: ${(error as Error).message}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Magento Paint MCP server running on stdio');
  }
}

const server = new MagentoMySQLServer();
server.run().catch(console.error);
