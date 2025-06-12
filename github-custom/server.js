#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

class GitHubMCPServer {
  constructor() {
    this.octokit = new Octokit({
      auth: GITHUB_TOKEN,
    });

    this.server = new Server(
      {
        name: 'github-custom-mcp-server',
        version: '1.0.0',
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
          name: 'create_repository',
          description: 'Create a new GitHub repository',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Repository name',
              },
              description: {
                type: 'string',
                description: 'Repository description',
              },
              private: {
                type: 'boolean',
                description: 'Whether the repository should be private',
                default: false,
              },
              auto_init: {
                type: 'boolean',
                description: 'Initialize with README',
                default: false,
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'search_repositories',
          description: 'Search for GitHub repositories',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query (GitHub search syntax)',
              },
              per_page: {
                type: 'number',
                description: 'Results per page (max 100)',
                default: 30,
              },
              page: {
                type: 'number',
                description: 'Page number',
                default: 1,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_repository',
          description: 'Get repository details',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Repository owner',
              },
              repo: {
                type: 'string',
                description: 'Repository name',
              },
            },
            required: ['owner', 'repo'],
          },
        },
        {
          name: 'create_issue',
          description: 'Create a new issue',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Repository owner',
              },
              repo: {
                type: 'string',
                description: 'Repository name',
              },
              title: {
                type: 'string',
                description: 'Issue title',
              },
              body: {
                type: 'string',
                description: 'Issue body',
              },
              labels: {
                type: 'array',
                items: { type: 'string' },
                description: 'Issue labels',
              },
            },
            required: ['owner', 'repo', 'title'],
          },
        },
        {
          name: 'create_pull_request',
          description: 'Create a pull request',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Repository owner',
              },
              repo: {
                type: 'string',
                description: 'Repository name',
              },
              title: {
                type: 'string',
                description: 'PR title',
              },
              head: {
                type: 'string',
                description: 'Branch to merge from',
              },
              base: {
                type: 'string',
                description: 'Branch to merge into',
              },
              body: {
                type: 'string',
                description: 'PR description',
              },
            },
            required: ['owner', 'repo', 'title', 'head', 'base'],
          },
        },
        {
          name: 'list_user_repos',
          description: 'List repositories for the authenticated user',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['all', 'owner', 'public', 'private', 'member'],
                description: 'Type of repositories to list',
                default: 'all',
              },
              sort: {
                type: 'string',
                enum: ['created', 'updated', 'pushed', 'full_name'],
                description: 'Sort order',
                default: 'created',
              },
              per_page: {
                type: 'number',
                description: 'Results per page',
                default: 30,
              },
            },
          },
        },
        {
          name: 'get_file_contents',
          description: 'Get contents of a file from a repository',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Repository owner',
              },
              repo: {
                type: 'string',
                description: 'Repository name',
              },
              path: {
                type: 'string',
                description: 'File path',
              },
              ref: {
                type: 'string',
                description: 'Branch/tag/commit ref',
                default: 'main',
              },
            },
            required: ['owner', 'repo', 'path'],
          },
        },
        {
          name: 'create_or_update_file',
          description: 'Create or update a file in a repository',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Repository owner',
              },
              repo: {
                type: 'string',
                description: 'Repository name',
              },
              path: {
                type: 'string',
                description: 'File path',
              },
              message: {
                type: 'string',
                description: 'Commit message',
              },
              content: {
                type: 'string',
                description: 'File content (will be base64 encoded)',
              },
              branch: {
                type: 'string',
                description: 'Branch name',
                default: 'main',
              },
              sha: {
                type: 'string',
                description: 'SHA of file being updated (required for updates)',
              },
            },
            required: ['owner', 'repo', 'path', 'message', 'content'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result;

        switch (name) {
          case 'create_repository':
            result = await this.octokit.repos.createForAuthenticatedUser({
              name: args.name,
              description: args.description,
              private: args.private || false,
              auto_init: args.auto_init || false,
            });
            break;

          case 'search_repositories':
            result = await this.octokit.search.repos({
              q: args.query,
              per_page: args.per_page || 30,
              page: args.page || 1,
            });
            break;

          case 'get_repository':
            result = await this.octokit.repos.get({
              owner: args.owner,
              repo: args.repo,
            });
            break;

          case 'create_issue':
            result = await this.octokit.issues.create({
              owner: args.owner,
              repo: args.repo,
              title: args.title,
              body: args.body,
              labels: args.labels,
            });
            break;

          case 'create_pull_request':
            result = await this.octokit.pulls.create({
              owner: args.owner,
              repo: args.repo,
              title: args.title,
              head: args.head,
              base: args.base,
              body: args.body,
            });
            break;

          case 'list_user_repos':
            result = await this.octokit.repos.listForAuthenticatedUser({
              type: args.type || 'all',
              sort: args.sort || 'created',
              per_page: args.per_page || 30,
            });
            break;

          case 'get_file_contents':
            result = await this.octokit.repos.getContent({
              owner: args.owner,
              repo: args.repo,
              path: args.path,
              ref: args.ref || 'main',
            });
            break;

          case 'create_or_update_file':
            const content = Buffer.from(args.content).toString('base64');
            const params = {
              owner: args.owner,
              repo: args.repo,
              path: args.path,
              message: args.message,
              content: content,
              branch: args.branch || 'main',
            };
            
            // If SHA is provided, it's an update
            if (args.sha) {
              params.sha = args.sha;
            }
            
            result = await this.octokit.repos.createOrUpdateFileContents(params);
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
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
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('GitHub Custom MCP Server running...');
  }
}

const server = new GitHubMCPServer();
server.run().catch(console.error);