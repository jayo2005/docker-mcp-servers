#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import sql from 'mssql';

// Parse connection string or use environment variables
const config = {
  server: process.env.MSSQL_SERVER || '192.168.20.188',
  database: process.env.MSSQL_DATABASE || 'AdvanceCoatings',
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD || 'Sc00tZujeva',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

async function ensureConnection() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

class SageMSSQLServer {
  constructor() {
    this.server = new Server(
      {
        name: "sage-mssql-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "query",
          description: "Run a read-only SQL query against the MSSQL database",
          inputSchema: {
            type: "object",
            properties: {
              sql: {
                type: "string",
                description: "The SQL query to execute (read-only)"
              }
            },
            required: ["sql"]
          }
        },
        {
          name: "list_tables",
          description: "List all tables in the database",
          inputSchema: {
            type: "object",
            properties: {}
          }
        },
        {
          name: "describe_table",
          description: "Get the schema information for a specific table",
          inputSchema: {
            type: "object",
            properties: {
              table_name: {
                type: "string",
                description: "The name of the table to describe"
              }
            },
            required: ["table_name"]
          }
        }
      ],
    }));

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        try {
          const pool = await ensureConnection();
          
          switch (request.params.name) {
            case "query": {
              const { sql: query } = request.params.arguments;
              
              // Basic safety check - only allow SELECT queries
              const normalizedQuery = query.trim().toUpperCase();
              if (!normalizedQuery.startsWith('SELECT') && 
                  !normalizedQuery.startsWith('WITH') &&
                  !normalizedQuery.startsWith('SHOW')) {
                throw new Error("Only SELECT queries are allowed");
              }
              
              const result = await pool.request().query(query);
              
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result.recordset, null, 2)
                  }
                ]
              };
            }
            
            case "list_tables": {
              const query = `
                SELECT 
                  TABLE_SCHEMA,
                  TABLE_NAME,
                  TABLE_TYPE
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_TYPE = 'BASE TABLE'
                ORDER BY TABLE_SCHEMA, TABLE_NAME
              `;
              
              const result = await pool.request().query(query);
              
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result.recordset, null, 2)
                  }
                ]
              };
            }
            
            case "describe_table": {
              const { table_name } = request.params.arguments;
              
              const query = `
                SELECT 
                  COLUMN_NAME,
                  DATA_TYPE,
                  CHARACTER_MAXIMUM_LENGTH,
                  IS_NULLABLE,
                  COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = @tableName
                ORDER BY ORDINAL_POSITION
              `;
              
              const result = await pool.request()
                .input('tableName', sql.VarChar, table_name)
                .query(query);
              
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result.recordset, null, 2)
                  }
                ]
              };
            }
            
            default:
              throw new Error(`Unknown tool: ${request.params.name}`);
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error.message}`
              }
            ],
            isError: true,
          };
        }
      }
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Sage MSSQL MCP server running on stdio");
  }
}

const server = new SageMSSQLServer();
server.run().catch(console.error);