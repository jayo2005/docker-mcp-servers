# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Primary Role: MCP Server Developer and Maintainer

You are the dedicated MCP server developer for this infrastructure. Your responsibilities:
- Proactively identify and fix any MCP server issues
- Maintain and improve existing MCP servers
- Add new MCP servers as requested
- Ensure all servers are functioning correctly
- Update documentation as needed
- Only use external tools (web search, research) when specifically needed to fix MCP issues

## MCP Server Infrastructure Overview

This repository implements a Docker-based MCP (Model Context Protocol) server infrastructure that extends Claude Code's capabilities through containerized microservices. Each MCP server runs in isolation and communicates via stdin/stdout.

Currently hosting 14 MCP servers providing capabilities for:
- File system access and GitHub integration
- Database access (PostgreSQL, MSSQL)
- Odoo ERP integration (multiple versions, SQL & API)
- Browser automation and web scraping
- Excel file manipulation
- Web search and AI-powered deep research
- WordPress and Elementor page builder integration
- WhatsApp Cloud API for messaging and media

## Essential Commands

### Server Management
```bash
# Build all Docker images
./manage.sh build

# Start all MCP servers
./manage.sh start

# Stop all MCP servers
./manage.sh stop

# View logs for all servers or specific server
./manage.sh logs [service-name]

# Test all MCP servers
./manage.sh test

# List configured Claude Code MCP servers
claude mcp list
```

### Adding New MCP Servers
1. Add service definition to `docker-compose.yml` following the pattern:
   ```yaml
   mcp-newserver:
     build:
       context: .
       dockerfile: Dockerfile.base
     container_name: mcp-newserver
     environment:
       - API_KEY=${API_KEY}  # If API key needed
     volumes:
       - ./newserver:/app
     stdin_open: true
     tty: false
     command: npx -y @provider/server-package
     networks:
       - mcp-network
   ```

2. Create directory: `mkdir -p newserver`

3. Create wrapper script: `scripts/mcp-newserver.sh`
   ```bash
   #!/bin/bash
   cd /home/jason/MCP_SERVERS
   docker compose run --rm -i mcp-newserver
   ```

4. Make executable: `chmod +x scripts/mcp-newserver.sh`

5. Add environment variables to `.env.template` if needed

6. Register with Claude Code: `claude mcp add newserver /home/jason/MCP_SERVERS/scripts/mcp-newserver.sh`

7. Build Docker image: `docker compose build mcp-newserver`

8. Update documentation in README.md and test-servers.sh

## Architecture Patterns

### Container Configuration
- All services use `Dockerfile.base` (Node.js 20 Alpine)
- Non-root user `mcpuser` for security
- Required settings: `stdin_open: true`, `tty: false`
- Shared network: `mcp-network`

### Volume Mount Patterns
- Server workspace: `./servername:/app`
- File access (read-only): `/home/jason:/home/jason:ro`
- File access (read-write): `/home/jason:/home/jason:rw`

### Environment Variables
- Sensitive data via `.env` file (copy from `.env.template`)
- Default values in docker-compose.yml using `${VAR:-default}`
- Host database access: `host.docker.internal`

### Special Capabilities
- Browser automation (puppeteer): requires `cap_add: - SYS_ADMIN`
- Host network access: requires `extra_hosts: - "host.docker.internal:host-gateway"`

## Current MCP Servers

### Core Servers
1. **filesystem** - Read-only access to /home/jason
2. **github** - GitHub API (requires GITHUB_TOKEN in .env) - Custom implementation fixing authentication issues
3. **puppeteer** - Browser automation
4. **excel** - Excel file manipulation
5. **duckduckgo** - Web search
6. **octagon-deep-research** - AI-powered deep research (requires OCTAGON_API_KEY in .env)
7. **whatsapp** - WhatsApp Cloud API for messaging and media (requires WhatsApp credentials in .env)

### Database Servers
8. **ODOO_17_paint** - PostgreSQL/Odoo 17 database direct SQL access
9. **Sage_MSSQL** - Microsoft SQL Server for Sage/AdvanceCoatings

### Odoo API Servers
10. **ODOO_MCP** - Universal Odoo API server (works with v12-v17+)
11. **ODOO16** - Dedicated Odoo v16 API access
12. **ODOO17** - Dedicated Odoo v17 API access

### WordPress/Web Development
13. **wordpress** - WordPress REST API access
14. **elementor** - Elementor page builder integration

## Quick Registration Commands

From your project directory, run these commands to register all MCP servers:

```bash
# Core servers
claude mcp add filesystem /home/jason/MCP_SERVERS/scripts/mcp-filesystem.sh
claude mcp add github /home/jason/MCP_SERVERS/scripts/mcp-github.sh
claude mcp add puppeteer /home/jason/MCP_SERVERS/scripts/mcp-puppeteer.sh
claude mcp add excel /home/jason/MCP_SERVERS/scripts/mcp-excel.sh
claude mcp add duckduckgo /home/jason/MCP_SERVERS/scripts/mcp-duckduckgo.sh
claude mcp add octagon-deep-research /home/jason/MCP_SERVERS/scripts/mcp-octagon-deep-research.sh

# Database servers
claude mcp add ODOO_17_paint /home/jason/MCP_SERVERS/scripts/mcp-odoo-17-paint.sh
claude mcp add Sage_MSSQL /home/jason/MCP_SERVERS/scripts/mcp-sage-mssql.sh

# Odoo API servers
claude mcp add ODOO_MCP /home/jason/MCP_SERVERS/scripts/mcp-odoo-mcp.sh
claude mcp add ODOO16 /home/jason/MCP_SERVERS/scripts/mcp-odoo16.sh
claude mcp add ODOO17 /home/jason/MCP_SERVERS/scripts/mcp-odoo17.sh

# WordPress/Web development
claude mcp add wordpress /home/jason/MCP_SERVERS/scripts/mcp-wordpress.sh
claude mcp add elementor /home/jason/MCP_SERVERS/scripts/mcp-elementor.sh
```

## Server-Specific Notes

### ODOO_17_paint Database Server
- Configured for Odoo 17 ERP database access
- Credentials: `odoo:Sc00tZujeva`
- Connection: `postgresql://odoo:Sc00tZujeva@host.docker.internal:5432/postgres`
- Access to all Odoo tables (res_users, res_partner, sale_order, product_product, etc.)

### ODOO16 Server
- Docker-based Odoo v16 instance
- Port: 10016
- Database: demo_theme4
- Credentials: info@softcroft.ie / Sc00tZujeva
- Full XML-RPC access to all Odoo models

### ODOO17 Server  
- Native Odoo v17 installation at /home/jason/odoo17_src
- Port: 8069
- Database: inter2
- Credentials: info@softcroft.ie / Sc00tZujeva
- Configuration: /home/jason/odoo17_src/odoo.conf
- Full XML-RPC access to all Odoo models

### Sage_MSSQL Server
- Microsoft SQL Server 2017 on Ubuntu 18.04
- Server: 192.168.20.188:1433
- Database: AdvanceCoatings
- Credentials: sa / Sc00tZujeva
- 400+ Sage accounting tables available
- Key tables: StockItem, Customer, Supplier, BOM, etc.
- Requires custom Dockerfile for permissions

### Octagon Deep Research Server
- Requires API key from https://docs.octagonagents.com
- No rate limits for research queries
- Superior to ChatGPT/Grok/Perplexity deep research capabilities
- Set OCTAGON_API_KEY in .env file before use

### GitHub MCP Server (Custom Implementation)
- Fixed authentication issue with original @modelcontextprotocol/server-github
- Uses custom Octokit-based implementation for proper GitHub API authentication
- Full support for all GitHub operations including repository creation
- Located in `/github-custom/` directory with custom Dockerfile
- Automatically used when you run the standard GitHub MCP server
- Contains 28 tools including: repository creation, issue management, pull requests, workflow runs, labels, and comments
- **Important**: If experiencing authentication issues, check for conflicting MCP servers (e.g., Cline's GitHub MCP) and remove them

## Troubleshooting

### Server Not Appearing in Claude Code
- Verify server is added: `claude mcp list`
- Check wrapper script is executable: `ls -la scripts/`
- Test server directly: `./scripts/mcp-servername.sh`

### Connection Issues
- Check Docker service: `docker compose ps`
- View server logs: `docker compose logs mcp-servername`
- Verify environment variables: `cat .env`
- Rebuild if needed: `docker compose build mcp-servername`

### Common Issues
- **"No MCP servers configured"**: Servers are registered per-project. Run `claude mcp list` to verify
- **API key errors**: Check .env file has correct API keys (GITHUB_TOKEN, OCTAGON_API_KEY)
- **Database connection fails**: Ensure PostgreSQL is running on host and accepting connections
- **Permission denied**: Make wrapper scripts executable with `chmod +x scripts/*.sh`
- **GitHub MCP "Unauthorized" errors**: If GitHub MCP shows authentication errors in Claude but works via direct testing:
  - The MCP server itself is working correctly (test with `echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | ./scripts/mcp-github.sh`)
  - Issue is with Claude's MCP connection caching
  - Check for conflicting MCP servers: Run `claude mcp list | grep -i github` - should only show one entry
  - Common cause: Cline or other tools may have registered their own GitHub MCP servers
  - Solution: Remove conflicting servers and ensure only `/home/jason/MCP_SERVERS/scripts/mcp-github.sh` is registered
  - Workaround: Use `gh` CLI commands instead (e.g., `gh repo create`, `gh issue create`)
  - Fix: Refresh Claude page or restart Claude Code to clear MCP cache

### Odoo MCP Server Specific Issues

#### Setting Up Odoo MCP Servers from Scratch

When creating Odoo MCP servers (ODOO16, ODOO17, ODOO_MCP), follow these steps:

1. **Create Node.js-based server** (not Python):
   ```bash
   mkdir -p odoo16
   # Create package.json with @modelcontextprotocol/sdk and xmlrpc dependencies
   # Create server.js implementing MCP protocol with Odoo XML-RPC
   ```

2. **Use custom Dockerfile with proper permissions**:
   ```dockerfile
   FROM node:20-alpine
   # ... other setup ...
   WORKDIR /app
   RUN chown -R mcpuser:mcpuser /app  # Critical for npm install
   USER mcpuser
   ```

3. **Configure environment variables correctly**:
   - `ODOO_URL`: Use `http://host.docker.internal:PORT` for Docker
   - `ODOO_DB`: Exact database name (check Odoo database selector)
   - `ODOO_USER`: User's login (often email address)
   - `ODOO_PASSWORD`: User's password (NOT master password)

#### Common Odoo MCP Errors and Solutions

1. **"Access Denied" Error**
   - Wrong credentials: Use Odoo user login (email), not "admin"
   - Password is the user's login password, not admin_passwd from odoo.conf
   - Example: `info@softcroft.ie` / `Sc00tZujeva`

2. **"KeyError: 'res.users'" Error**
   - Database name is incorrect
   - Solution: Find correct database name from Odoo login page or docker-compose.yml
   - Example: Use `demo_theme4` not `postgres`

3. **"pip: not found" Error**
   - Trying to use Python in Node.js base image
   - Solution: Create proper Node.js-based MCP server, not Python

4. **NPM Permission Errors**
   - Docker container permissions issue
   - Solution: Add `RUN chown -R mcpuser:mcpuser /app` before USER directive

5. **Connection Refused**
   - Wrong port or host configuration
   - Solution: Check Odoo docker-compose.yml for correct port mapping
   - Example: Port 10016 for Odoo 16, not default 8069

#### Testing Odoo MCP Servers

```bash
# Test tools list
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | ./scripts/mcp-odoo16.sh

# Test connection with search_read
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "search_read", "arguments": {"model": "res.users", "fields": ["id", "name", "login"], "limit": 1}}, "id": 2}' | ./scripts/mcp-odoo16.sh
```

#### Odoo Server Tools Available
- `search_read`: Search and read records with domain filters
- `create`: Create new records
- `write`: Update existing records  
- `unlink`: Delete records
- `fields_get`: Get model field definitions

### Sage MSSQL Server Specific Issues

#### Setting Up Sage MSSQL MCP Server

1. **Create custom Dockerfile** (Dockerfile.sage-mssql):
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   RUN chown -R mcpuser:mcpuser /app
   USER mcpuser
   ```

2. **NPM Permission Errors**
   - Always use custom Dockerfile, not Dockerfile.base
   - Ensure proper ownership before npm install

3. **Connection Timeout Issues**
   - Initial connection may take 10-30 seconds
   - SQL Server needs time to establish connection
   - Use timeout wrappers for testing

#### Common Sage MSSQL Errors and Solutions

1. **"EACCES: permission denied" during npm install**
   - Solution: Use custom Dockerfile with proper chown commands
   - Update docker-compose.yml to use Dockerfile.sage-mssql

2. **Connection Timeouts**
   - Test connectivity: `docker compose run --rm mcp-sage-mssql ping 192.168.20.188`
   - Test port: `docker compose run --rm mcp-sage-mssql nc -zv 192.168.20.188 1433`
   - Initial queries may take longer due to connection setup

3. **Invalid Column Names**
   - Use `describe_table` tool first to get correct column names
   - Sage uses "Code" not "Sku", "Name" not "ProductName"

#### Testing Sage MSSQL Server

```bash
# Test tools list
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | ./scripts/mcp-sage-mssql.sh

# List tables (may timeout on first run)
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "list_tables", "arguments": {}}, "id": 2}' | timeout 15 ./scripts/mcp-sage-mssql.sh

# Describe StockItem table
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "describe_table", "arguments": {"table_name": "StockItem"}}, "id": 3}' | ./scripts/mcp-sage-mssql.sh
```

#### Sage Server Tools Available
- `query`: Execute read-only SQL queries
- `list_tables`: List all database tables
- `describe_table`: Get table schema information