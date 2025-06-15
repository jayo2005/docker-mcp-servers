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

const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306');
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE1 = process.env.MYSQL_DATABASE1;
const MYSQL_DATABASE2 = process.env.MYSQL_DATABASE2;

if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE1 || !MYSQL_DATABASE2) {
  throw new Error('Missing required environment variables for MySQL connection. Need MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE1, and MYSQL_DATABASE2.');
}

class MySQLTikkurilaServer {
  private server: Server;
  private pool1: mysql.Pool;
  private pool2: mysql.Pool;

  constructor() {
    this.server = new Server(
      {
        name: 'mysql-tikkurila-server',
        version: '0.1.0',
        description: 'MCP server for interacting with Tikkurila MySQL databases for paint mixing data.',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Create pool for first database
    this.pool1 = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE1,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Create pool for second database
    this.pool2 = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE2,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      await this.pool1.end();
      await this.pool2.end();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_base_paints',
          description: 'Retrieves all base paints with their properties.',
          inputSchema: { type: 'object', properties: {}, required: [] },
        },
        {
          name: 'get_cans',
          description: 'Retrieves all can information.',
          inputSchema: { type: 'object', properties: {}, required: [] },
        },
        {
          name: 'get_can_sizes',
          description: 'Retrieves all can sizes.',
          inputSchema: { type: 'object', properties: {}, required: [] },
        },
        {
          name: 'get_card_in_zones',
          description: 'Retrieves all card in zones information.',
          inputSchema: { type: 'object', properties: {}, required: [] },
        },
        {
          name: 'get_color_names',
          description: 'Retrieves all color names.',
          inputSchema: { type: 'object', properties: {}, required: [] },
        },
        {
          name: 'get_color_cards',
          description: 'Retrieves all color cards.',
          inputSchema: { type: 'object', properties: {}, required: [] },
        },
        {
          name: 'get_products',
          description: 'Retrieves all products.',
          inputSchema: { type: 'object', properties: {}, required: [] },
        },
        {
          name: 'execute_query',
          description: 'Executes a custom SQL query on either database.',
          inputSchema: {
            type: 'object',
            properties: {
              database: { 
                type: 'number', 
                description: 'Which database to query (1 or 2)',
                enum: [1, 2],
              },
              query: { type: 'string', description: 'The SQL query to execute.' },
              params: {
                type: 'array',
                description: 'An array of parameters for the SQL query.',
                items: {
                  type: ['string', 'number', 'boolean', 'null'],
                },
              },
            },
            required: ['database', 'query'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_base_paints': {
            const [rows] = await this.pool1.execute('SELECT * FROM basepaint');
            return { content: [{ type: 'text', text: JSON.stringify(rows) }] };
          }
          case 'get_cans': {
            const [rows] = await this.pool1.execute('SELECT * FROM can');
            return { content: [{ type: 'text', text: JSON.stringify(rows) }] };
          }
          case 'get_can_sizes': {
            const [rows] = await this.pool1.execute('SELECT * FROM cansize');
            return { content: [{ type: 'text', text: JSON.stringify(rows) }] };
          }
          case 'get_card_in_zones': {
            const [rows] = await this.pool1.execute('SELECT * FROM cardinzone');
            return { content: [{ type: 'text', text: JSON.stringify(rows) }] };
          }
          case 'get_color_names': {
            const [rows] = await this.pool1.execute('SELECT * FROM colname');
            return { content: [{ type: 'text', text: JSON.stringify(rows) }] };
          }
          case 'get_color_cards': {
            const [rows] = await this.pool1.execute('SELECT * FROM colourcard');
            return { content: [{ type: 'text', text: JSON.stringify(rows) }] };
          }
          case 'get_products': {
            const [rows] = await this.pool1.execute('SELECT * FROM product');
            return { content: [{ type: 'text', text: JSON.stringify(rows) }] };
          }
          case 'execute_query': {
            const args = request.params.arguments as { database: number; query: string; params?: any[] };
            if (!args || typeof args.query !== 'string' || !args.database) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing or invalid "database" or "query" argument.');
            }
            if (args.database !== 1 && args.database !== 2) {
              throw new McpError(ErrorCode.InvalidParams, 'Database must be 1 or 2.');
            }
            const pool = args.database === 1 ? this.pool1 : this.pool2;
            const [rows, fields] = await pool.execute(args.query, args.params || []);
            // For SELECT queries, rows will be an array of objects.
            // For INSERT/UPDATE/DELETE, rows will be an OkPacket or similar.
            // We'll stringify whatever we get.
            return { content: [{ type: 'text', text: JSON.stringify(rows) }] };
          }
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        console.error('Error executing tool:', error);
        return {
          content: [{ type: 'text', text: `Error: ${error}` }],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MySQL Paint MCP server running on stdio');
  }
}

const server = new MySQLTikkurilaServer();
server.run().catch(console.error);
