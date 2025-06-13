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
        {
          name: 'push_files',
          description: 'Push multiple files to a repository in a single commit',
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
              branch: {
                type: 'string',
                description: 'Branch name',
                default: 'main',
              },
              message: {
                type: 'string',
                description: 'Commit message',
              },
              files: {
                type: 'array',
                description: 'Array of files to commit',
                items: {
                  type: 'object',
                  properties: {
                    path: {
                      type: 'string',
                      description: 'File path',
                    },
                    content: {
                      type: 'string',
                      description: 'File content',
                    },
                    mode: {
                      type: 'string',
                      description: 'File mode (100644 for file, 100755 for executable, 040000 for directory)',
                      default: '100644',
                    },
                  },
                  required: ['path', 'content'],
                },
              },
            },
            required: ['owner', 'repo', 'branch', 'message', 'files'],
          },
        },
        {
          name: 'clone_repository',
          description: 'Get all files from a repository (similar to git clone)',
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
              branch: {
                type: 'string',
                description: 'Branch to clone',
                default: 'main',
              },
              path: {
                type: 'string',
                description: 'Path prefix to filter files (optional)',
              },
            },
            required: ['owner', 'repo'],
          },
        },
        {
          name: 'pull_changes',
          description: 'Get latest changes from remote (list of changed files)',
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
              branch: {
                type: 'string',
                description: 'Branch name',
                default: 'main',
              },
              since: {
                type: 'string',
                description: 'ISO 8601 date to get changes since',
              },
            },
            required: ['owner', 'repo'],
          },
        },
        {
          name: 'create_branch',
          description: 'Create a new branch',
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
              branch: {
                type: 'string',
                description: 'New branch name',
              },
              from_branch: {
                type: 'string',
                description: 'Source branch',
                default: 'main',
              },
            },
            required: ['owner', 'repo', 'branch'],
          },
        },
        {
          name: 'delete_branch',
          description: 'Delete a branch',
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
              branch: {
                type: 'string',
                description: 'Branch to delete',
              },
            },
            required: ['owner', 'repo', 'branch'],
          },
        },
        {
          name: 'list_branches',
          description: 'List all branches',
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
          name: 'get_commits',
          description: 'Get commit history',
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
              sha: {
                type: 'string',
                description: 'SHA or branch to list commits from',
                default: 'main',
              },
              per_page: {
                type: 'number',
                description: 'Number of commits per page',
                default: 30,
              },
            },
            required: ['owner', 'repo'],
          },
        },
        {
          name: 'get_commit_diff',
          description: 'Get diff for a specific commit',
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
              sha: {
                type: 'string',
                description: 'Commit SHA',
              },
            },
            required: ['owner', 'repo', 'sha'],
          },
        },
        {
          name: 'compare_branches',
          description: 'Compare two branches',
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
              base: {
                type: 'string',
                description: 'Base branch',
              },
              head: {
                type: 'string',
                description: 'Head branch',
              },
            },
            required: ['owner', 'repo', 'base', 'head'],
          },
        },
        {
          name: 'merge_branch',
          description: 'Merge one branch into another',
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
              base: {
                type: 'string',
                description: 'Base branch to merge into',
              },
              head: {
                type: 'string',
                description: 'Head branch to merge from',
              },
              commit_message: {
                type: 'string',
                description: 'Merge commit message',
              },
            },
            required: ['owner', 'repo', 'base', 'head'],
          },
        },
        {
          name: 'fork_repository',
          description: 'Fork a repository',
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
              organization: {
                type: 'string',
                description: 'Optional organization to fork to',
              },
            },
            required: ['owner', 'repo'],
          },
        },
        {
          name: 'sync_fork',
          description: 'Sync fork with upstream repository',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Fork owner',
              },
              repo: {
                type: 'string',
                description: 'Fork repository name',
              },
              branch: {
                type: 'string',
                description: 'Branch to sync',
                default: 'main',
              },
            },
            required: ['owner', 'repo'],
          },
        },
        {
          name: 'delete_file',
          description: 'Delete a file from repository',
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
                description: 'File path to delete',
              },
              message: {
                type: 'string',
                description: 'Commit message',
              },
              branch: {
                type: 'string',
                description: 'Branch name',
                default: 'main',
              },
              sha: {
                type: 'string',
                description: 'SHA of file to delete',
              },
            },
            required: ['owner', 'repo', 'path', 'message', 'sha'],
          },
        },
        {
          name: 'search_code',
          description: 'Search for code in repositories',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
              per_page: {
                type: 'number',
                description: 'Results per page',
                default: 30,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_repository_topics',
          description: 'Get repository topics/tags',
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
          name: 'set_repository_topics',
          description: 'Set repository topics/tags',
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
              topics: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of topics',
              },
            },
            required: ['owner', 'repo', 'topics'],
          },
        },
        {
          name: 'get_issue_comments',
          description: 'Get comments on an issue',
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
              issue_number: {
                type: 'number',
                description: 'Issue number',
              },
              per_page: {
                type: 'number',
                description: 'Results per page',
                default: 30,
              },
            },
            required: ['owner', 'repo', 'issue_number'],
          },
        },
        {
          name: 'create_issue_comment',
          description: 'Create a comment on an issue',
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
              issue_number: {
                type: 'number',
                description: 'Issue number',
              },
              body: {
                type: 'string',
                description: 'Comment body',
              },
            },
            required: ['owner', 'repo', 'issue_number', 'body'],
          },
        },
        {
          name: 'add_issue_labels',
          description: 'Add labels to an issue',
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
              issue_number: {
                type: 'number',
                description: 'Issue number',
              },
              labels: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of label names to add',
              },
            },
            required: ['owner', 'repo', 'issue_number', 'labels'],
          },
        },
        {
          name: 'list_workflow_runs',
          description: 'List workflow runs for a repository',
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
              workflow_id: {
                type: 'string',
                description: 'Workflow ID or filename (optional)',
              },
              status: {
                type: 'string',
                enum: ['completed', 'action_required', 'cancelled', 'failure', 'neutral', 'skipped', 'stale', 'success', 'timed_out', 'in_progress', 'queued', 'requested', 'waiting'],
                description: 'Filter by status',
              },
              per_page: {
                type: 'number',
                description: 'Results per page',
                default: 30,
              },
            },
            required: ['owner', 'repo'],
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

          case 'clone_repository':
            // Get repository tree
            const { data: tree } = await this.octokit.git.getTree({
              owner: args.owner,
              repo: args.repo,
              tree_sha: args.branch || 'main',
              recursive: true,
            });

            // Filter by path if provided
            let files = tree.tree.filter(item => item.type === 'blob');
            if (args.path) {
              files = files.filter(item => item.path.startsWith(args.path));
            }

            // Get file contents
            const fileContents = await Promise.all(
              files.map(async (file) => {
                try {
                  const { data } = await this.octokit.repos.getContent({
                    owner: args.owner,
                    repo: args.repo,
                    path: file.path,
                    ref: args.branch || 'main',
                  });
                  return {
                    path: file.path,
                    content: Buffer.from(data.content, 'base64').toString('utf-8'),
                    sha: data.sha,
                  };
                } catch (error) {
                  return {
                    path: file.path,
                    error: error.message,
                  };
                }
              })
            );
            result = { files: fileContents };
            break;

          case 'pull_changes':
            // Get commits on branch
            const { data: commits } = await this.octokit.repos.listCommits({
              owner: args.owner,
              repo: args.repo,
              sha: args.branch || 'main',
              since: args.since,
              per_page: 100,
            });

            // Get changed files for each commit
            const changes = await Promise.all(
              commits.map(async (commit) => {
                const { data: commitDetail } = await this.octokit.repos.getCommit({
                  owner: args.owner,
                  repo: args.repo,
                  ref: commit.sha,
                });
                return {
                  sha: commit.sha,
                  message: commit.commit.message,
                  author: commit.commit.author,
                  date: commit.commit.author.date,
                  files: commitDetail.files.map(f => ({
                    path: f.filename,
                    status: f.status,
                    additions: f.additions,
                    deletions: f.deletions,
                  })),
                };
              })
            );
            result = { commits: changes };
            break;

          case 'create_branch':
            // Get the SHA of the source branch
            const { data: sourceBranch } = await this.octokit.git.getRef({
              owner: args.owner,
              repo: args.repo,
              ref: `heads/${args.from_branch || 'main'}`,
            });

            // Create new branch
            result = await this.octokit.git.createRef({
              owner: args.owner,
              repo: args.repo,
              ref: `refs/heads/${args.branch}`,
              sha: sourceBranch.object.sha,
            });
            break;

          case 'delete_branch':
            result = await this.octokit.git.deleteRef({
              owner: args.owner,
              repo: args.repo,
              ref: `heads/${args.branch}`,
            });
            break;

          case 'list_branches':
            result = await this.octokit.repos.listBranches({
              owner: args.owner,
              repo: args.repo,
              per_page: 100,
            });
            break;

          case 'get_commits':
            result = await this.octokit.repos.listCommits({
              owner: args.owner,
              repo: args.repo,
              sha: args.sha || 'main',
              per_page: args.per_page || 30,
            });
            break;

          case 'get_commit_diff':
            result = await this.octokit.repos.getCommit({
              owner: args.owner,
              repo: args.repo,
              ref: args.sha,
            });
            break;

          case 'compare_branches':
            result = await this.octokit.repos.compareCommits({
              owner: args.owner,
              repo: args.repo,
              base: args.base,
              head: args.head,
            });
            break;

          case 'merge_branch':
            result = await this.octokit.repos.merge({
              owner: args.owner,
              repo: args.repo,
              base: args.base,
              head: args.head,
              commit_message: args.commit_message,
            });
            break;

          case 'fork_repository':
            result = await this.octokit.repos.createFork({
              owner: args.owner,
              repo: args.repo,
              organization: args.organization,
            });
            break;

          case 'sync_fork':
            // Get the upstream repository info
            const { data: forkData } = await this.octokit.repos.get({
              owner: args.owner,
              repo: args.repo,
            });

            if (!forkData.parent) {
              throw new Error('Repository is not a fork');
            }

            // Sync with upstream
            result = await this.octokit.repos.mergeUpstream({
              owner: args.owner,
              repo: args.repo,
              branch: args.branch || 'main',
            });
            break;

          case 'delete_file':
            result = await this.octokit.repos.deleteFile({
              owner: args.owner,
              repo: args.repo,
              path: args.path,
              message: args.message,
              sha: args.sha,
              branch: args.branch || 'main',
            });
            break;

          case 'search_code':
            result = await this.octokit.search.code({
              q: args.query,
              per_page: args.per_page || 30,
            });
            break;

          case 'get_repository_topics':
            result = await this.octokit.repos.getAllTopics({
              owner: args.owner,
              repo: args.repo,
            });
            break;

          case 'set_repository_topics':
            result = await this.octokit.repos.replaceAllTopics({
              owner: args.owner,
              repo: args.repo,
              names: args.topics,
            });
            break;

          case 'push_files':
            // Get the latest commit SHA for the branch
            const { data: refData } = await this.octokit.git.getRef({
              owner: args.owner,
              repo: args.repo,
              ref: `heads/${args.branch || 'main'}`,
            });
            const latestCommitSha = refData.object.sha;

            // Get the tree SHA of the latest commit
            const { data: commitData } = await this.octokit.git.getCommit({
              owner: args.owner,
              repo: args.repo,
              commit_sha: latestCommitSha,
            });
            const baseTreeSha = commitData.tree.sha;

            // Create blobs for each file
            const blobs = await Promise.all(
              args.files.map(async (file) => {
                const { data: blobData } = await this.octokit.git.createBlob({
                  owner: args.owner,
                  repo: args.repo,
                  content: Buffer.from(file.content).toString('base64'),
                  encoding: 'base64',
                });
                return {
                  path: file.path,
                  mode: file.mode || '100644',
                  type: 'blob',
                  sha: blobData.sha,
                };
              })
            );

            // Create a new tree
            const { data: treeData } = await this.octokit.git.createTree({
              owner: args.owner,
              repo: args.repo,
              tree: blobs,
              base_tree: baseTreeSha,
            });

            // Create a new commit
            const { data: newCommitData } = await this.octokit.git.createCommit({
              owner: args.owner,
              repo: args.repo,
              message: args.message,
              tree: treeData.sha,
              parents: [latestCommitSha],
            });

            // Update the reference
            result = await this.octokit.git.updateRef({
              owner: args.owner,
              repo: args.repo,
              ref: `heads/${args.branch || 'main'}`,
              sha: newCommitData.sha,
            });
            break;

          case 'get_issue_comments':
            result = await this.octokit.issues.listComments({
              owner: args.owner,
              repo: args.repo,
              issue_number: args.issue_number,
              per_page: args.per_page || 30,
            });
            break;

          case 'create_issue_comment':
            result = await this.octokit.issues.createComment({
              owner: args.owner,
              repo: args.repo,
              issue_number: args.issue_number,
              body: args.body,
            });
            break;

          case 'add_issue_labels':
            result = await this.octokit.issues.addLabels({
              owner: args.owner,
              repo: args.repo,
              issue_number: args.issue_number,
              labels: args.labels,
            });
            break;

          case 'list_workflow_runs':
            const workflowParams = {
              owner: args.owner,
              repo: args.repo,
              per_page: args.per_page || 30,
            };
            if (args.workflow_id) {
              workflowParams.workflow_id = args.workflow_id;
            }
            if (args.status) {
              workflowParams.status = args.status;
            }
            result = await this.octokit.actions.listWorkflowRunsForRepo(workflowParams);
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