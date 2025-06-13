# Docker-based MCP Servers

This directory contains Docker-based MCP (Model Context Protocol) servers for use with Claude Code.

## Structure

- `Dockerfile.base` - Base Docker image for MCP servers
- `docker-compose.yml` - Docker Compose configuration for all servers
- `scripts/` - Wrapper scripts for each MCP server
- `.env.template` - Template for environment variables
- `manage.sh` - Management script for easy control
- `test-servers.sh` - Test script to verify servers

## Setup

1. Copy `.env.template` to `.env` and configure your environment variables:
   ```bash
   cp .env.template .env
   ```

2. Build the Docker images:
   ```bash
   docker compose build
   # or
   ./manage.sh build
   ```

## Available Servers

### filesystem
File system access server that provides read-only access to /home/jason directory. This server allows Claude to:
- Read files and directories
- List directory contents
- Search for files by pattern
- Get file metadata (size, permissions, timestamps)
- Navigate directory structures

### github
GitHub API integration server that enables Claude to:
- Create, read, update repositories
- Manage issues and pull requests
- Create branches and commits
- Search for code, repositories, and users
- Fork repositories
- Review and merge pull requests
- Access file contents from repositories

### postgres (ODOO_17_paint)
PostgreSQL database server configured for Odoo 17 database access. This server allows Claude to:
- Execute read-only SQL queries
- Access database schema information
- Query Odoo tables and data
- Perform data analysis on database contents

### puppeteer
Browser automation server using Puppeteer for web interaction. This server enables Claude to:
- Navigate to web pages
- Take screenshots of pages or specific elements
- Click on page elements
- Fill out forms and input fields
- Select dropdown options
- Hover over elements
- Execute JavaScript in the browser console
- Automate web testing and scraping tasks

### excel
Excel file manipulation server that allows Claude to:
- Read data from Excel files (.xlsx)
- Write data to Excel files
- Create new Excel spreadsheets
- Modify existing spreadsheet data
- Work with multiple sheets
- Handle Excel formulas and formatting

### duckduckgo
DuckDuckGo search server that enables Claude to:
- Perform web searches using DuckDuckGo
- Search for images, videos, and news
- Get instant answers and knowledge graph data
- Apply safe search filters
- Search within specific regions
- Filter results by date range
- Access search results without tracking

### octagon-deep-research
Octagon Deep Research server that provides Claude with:
- AI-powered comprehensive research and analysis capabilities
- No rate limits - execute unlimited queries
- Faster than ChatGPT Deep Research
- More thorough than Grok DeepSearch or Perplexity Deep Research
- Advanced deep research agents integration
- Specialized research synthesis and analysis

### whatsapp
WhatsApp Cloud API server that enables Claude to:
- Send text messages to WhatsApp users
- Send template messages (pre-approved marketing/utility messages)
- Send media files (images, videos, documents, audio)
- Create and manage message templates
- Mark messages as read
- Get webhook configuration for receiving messages
- Manage WhatsApp Business phone numbers
- FREE unlimited service conversations (customer support)
- Receive photos and create support tickets in Odoo

### Sage_MSSQL
Microsoft SQL Server database server for Sage/AdvanceCoatings access. This server enables Claude to:
- Execute read-only SQL queries on MSSQL databases
- List all tables in the database (400+ Sage tables available)
- Describe table schemas and column information
- Query data from Sage accounting and AdvanceCoatings tables
- Access StockItem, Customer, Supplier, and other core Sage tables
- Perform data analysis on paint products and inventory
- Server: 192.168.20.188
- Database: AdvanceCoatings
- Authentication: sa / Sc00tZujeva
- SQL Server 2017 on Ubuntu 18.04

### ODOO_MCP
Universal Odoo MCP server that works with Odoo versions 12-17+. This server provides Claude with:
- Full Odoo API access via XML-RPC/JSON-RPC protocols
- CRUD operations on any Odoo model (res.partner, sale.order, etc.)
- Search and read records with domain filters
- Create, update, and delete records
- Call custom Odoo methods
- Access binary fields and attachments
- Real-time session management
- Works with any Odoo version (tested with v12-v17)

### ODOO16 & ODOO17
Dedicated MCP servers for simultaneous access to multiple Odoo instances during migrations:

**ODOO16**: 
- Connects to Odoo v16 instance (demo_theme4 database)
- Port: 10016 (Docker-based installation)
- Authentication: info@softcroft.ie / Sc00tZujeva
- Full XML-RPC API access for all Odoo models

**ODOO17**:
- Connects to Odoo v17 instance (inter2 database)  
- Port: 8069 (Native installation at /home/jason/odoo17_src)
- Authentication: info@softcroft.ie / Sc00tZujeva
- Full XML-RPC API access for all Odoo models

Both servers support:
- Run simultaneously for migration tasks
- Compare data between versions
- Independent credentials and connection settings
- Perfect for data migration and version comparison tasks

### WordPress
WordPress MCP server for full REST API access to WordPress sites. This server enables Claude to:
- Read, create, update, and delete posts
- Manage pages, media, and custom post types
- Work with categories, tags, and taxonomies
- Manage users and comments
- Access and modify themes and plugins data
- Handle custom fields and meta data
- Work with WordPress menus
- Execute WordPress REST API endpoints
- Support for both basic authentication and application passwords

### Elementor
Elementor-specific MCP server for WordPress sites using Elementor page builder. This server provides Claude with:
- Natural language interaction with Elementor
- Create and modify Elementor pages and templates
- Work with Elementor widgets and sections
- Manage global styles and settings
- Handle responsive design settings
- Access Elementor's template library
- Modify page layouts and structures
- Work with dynamic content and custom CSS
- Full integration with WordPress REST API
- Optimized for Elementor-powered WordPress sites

## Odoo MCP Server Setup Guide

### Setting Up Odoo MCP Servers

The Odoo MCP servers require proper configuration to connect to your Odoo instances. Here's how to set them up:

#### 1. Prerequisites
- Odoo instance running and accessible
- Valid Odoo user credentials (not the master password)
- Correct database name

#### 2. Configure Environment Variables

Edit the `.env` file with your Odoo connection details:

```bash
# For Odoo 16
ODOO16_URL=http://host.docker.internal:10016  # Your Odoo 16 URL
ODOO16_DB=demo_theme4                          # Your database name
ODOO16_USER=info@softcroft.ie                  # Odoo user login (email)
ODOO16_PASSWORD=Sc00tZujeva                    # User password

# For Odoo 17
ODOO17_URL=http://host.docker.internal:8069   # Native installation
ODOO17_DB=inter2                               # Your database name
ODOO17_USER=info@softcroft.ie                  # Odoo user login (email)
ODOO17_PASSWORD=Sc00tZujeva                    # User password
```

**Important Notes:**
- Use `host.docker.internal` instead of `localhost` for Docker containers
- The username should be the Odoo user's login (often an email address)
- The password is the user's password, NOT the master password in odoo.conf
- Database name must match exactly (check via Odoo database selector)

#### 3. Create the Odoo MCP Server Files

For each Odoo server, create a directory and necessary files:

```bash
# Create directory
mkdir -p odoo16

# Create package.json
cat > odoo16/package.json << 'EOF'
{
  "name": "odoo16-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for Odoo 16",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "xmlrpc": "^1.3.2"
  }
}
EOF

# Create server.js (see full code in odoo16/server.js)
```

#### 4. Create Custom Dockerfile

Create `Dockerfile.odoo16`:

```dockerfile
FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache bash curl git

# Create non-root user
RUN adduser -D -s /bin/bash mcpuser

# Set working directory
WORKDIR /app

# Change ownership of app directory
RUN chown -R mcpuser:mcpuser /app

# Copy package.json first
COPY --chown=mcpuser:mcpuser odoo16/package.json ./

# Switch to non-root user
USER mcpuser

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY --chown=mcpuser:mcpuser odoo16/server.js ./

CMD ["npm", "start"]
```

#### 5. Update docker-compose.yml

```yaml
mcp-odoo16:
  build:
    context: .
    dockerfile: Dockerfile.odoo16
  container_name: mcp-odoo16
  environment:
    - ODOO_URL=${ODOO16_URL:-http://host.docker.internal:8069}
    - ODOO_DB=${ODOO16_DB:-odoo}
    - ODOO_USER=${ODOO16_USER:-admin}
    - ODOO_PASSWORD=${ODOO16_PASSWORD:-admin}
  extra_hosts:
    - "host.docker.internal:host-gateway"
  stdin_open: true
  tty: false
  networks:
    - mcp-network
```

#### 6. Build and Test

```bash
# Build the Docker image
docker compose build mcp-odoo16

# Test the server
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | ./scripts/mcp-odoo16.sh

# Test a query
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "search_read", "arguments": {"model": "res.users", "fields": ["id", "name", "login"], "limit": 1}}, "id": 2}' | ./scripts/mcp-odoo16.sh
```

### Troubleshooting Odoo MCP Servers

#### Common Issues

1. **"Access Denied" Error**
   - Verify username and password are correct
   - Use the Odoo user login (email), not "admin"
   - Check the password is the user's password, not the master password

2. **"KeyError: 'res.users'" Error**
   - Database name is incorrect
   - Check exact database name in Odoo database selector
   - Verify database exists and is accessible

3. **Connection Refused**
   - Check Odoo is running on the specified port
   - Use `host.docker.internal` for Docker containers
   - Verify firewall settings

4. **Permission Errors in Docker**
   - Ensure proper ownership in Dockerfile
   - Use `RUN chown -R mcpuser:mcpuser /app`
   - Switch to non-root user before npm install

#### Finding Correct Credentials

1. **Database Name**: 
   - Access Odoo login page
   - Check database selector dropdown
   - Or check in your docker-compose.yml for Odoo

2. **Username**: 
   - Usually an email address
   - Default admin user might be "admin" or an email
   - Check in Odoo's Users menu

3. **Password**: 
   - This is the user's login password
   - NOT the admin_passwd in odoo.conf
   - Reset via Odoo if forgotten

## Sage MSSQL Server Setup Guide

### Setting Up Sage MSSQL MCP Server

The Sage MSSQL server provides access to your Sage accounting data through SQL Server.

#### 1. Prerequisites
- SQL Server instance running and accessible
- SQL Server authentication enabled
- Network connectivity to SQL Server (port 1433)

#### 2. Configure Environment Variables

Edit the `.env` file with your SQL Server connection details:

```bash
# MSSQL Server Configuration
MSSQL_SERVER=192.168.20.188        # Your SQL Server IP/hostname
MSSQL_DATABASE=AdvanceCoatings     # Your database name
MSSQL_USER=sa                      # SQL Server user
MSSQL_PASSWORD=Sc00tZujeva         # SQL Server password
```

#### 3. Build and Test

```bash
# Build the Docker image
docker compose build mcp-sage-mssql

# Test the server
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | ./scripts/mcp-sage-mssql.sh

# Test a query
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "list_tables", "arguments": {}}, "id": 2}' | ./scripts/mcp-sage-mssql.sh
```

### Troubleshooting Sage MSSQL

#### Common Issues

1. **Connection Timeout**
   - Verify SQL Server is accessible from Docker container
   - Check firewall rules for port 1433
   - Test with: `docker compose run --rm mcp-sage-mssql nc -zv <server_ip> 1433`

2. **Authentication Failed**
   - Ensure SQL Server authentication is enabled (not just Windows auth)
   - Verify sa account is enabled
   - Check password is correct

3. **Permission Errors in Docker**
   - Use custom Dockerfile with proper permissions
   - Ensure npm packages can be installed

## Usage

### Quick Setup - Register All MCP Servers

From your project directory, run these commands to register all available MCP servers:

```bash
# Core servers
claude mcp add filesystem /home/jason/MCP_SERVERS/scripts/mcp-filesystem.sh
claude mcp add github /home/jason/MCP_SERVERS/scripts/mcp-github.sh
claude mcp add excel /home/jason/MCP_SERVERS/scripts/mcp-excel.sh
claude mcp add duckduckgo /home/jason/MCP_SERVERS/scripts/mcp-duckduckgo.sh
claude mcp add puppeteer /home/jason/MCP_SERVERS/scripts/mcp-puppeteer.sh
claude mcp add octagon-deep-research /home/jason/MCP_SERVERS/scripts/mcp-octagon-deep-research.sh
claude mcp add whatsapp /home/jason/MCP_SERVERS/scripts/mcp-whatsapp.sh

# Database servers
claude mcp add ODOO_17_paint /home/jason/MCP_SERVERS/scripts/mcp-odoo-17-paint.sh
claude mcp add Sage_MSSQL /home/jason/MCP_SERVERS/scripts/mcp-sage-mssql.sh

# Odoo servers (choose based on your needs)
claude mcp add ODOO_MCP /home/jason/MCP_SERVERS/scripts/mcp-odoo-mcp.sh
claude mcp add ODOO16 /home/jason/MCP_SERVERS/scripts/mcp-odoo16.sh
claude mcp add ODOO17 /home/jason/MCP_SERVERS/scripts/mcp-odoo17.sh

# WordPress/Web development servers
claude mcp add wordpress /home/jason/MCP_SERVERS/scripts/mcp-wordpress.sh
claude mcp add elementor /home/jason/MCP_SERVERS/scripts/mcp-elementor.sh

```

### Using MCP Servers in Claude Code

Once registered, use `/mcp` in Claude Code to see available servers:

```
Manage MCP Servers
13 servers found

❯ 1. filesystem              connected
  2. github                 connected
  3. ODOO_17_paint          connected
  4. puppeteer              connected
  5. excel                  connected
  6. duckduckgo             connected
  7. octagon-deep-research  connected
  8. Sage_MSSQL             connected
  9. ODOO_MCP               connected
  10. wordpress             connected
  11. elementor             connected
```

## Adding New Servers

1. Add the server to `docker-compose.yml`
2. Create a wrapper script in `scripts/`
3. Make the script executable: `chmod +x scripts/mcp-yourserver.sh`
4. Add to Claude Code: `claude mcp add yourserver /home/jason/MCP_SERVERS/scripts/mcp-yourserver.sh`

## Managing Servers

- List servers: `claude mcp list`
- Remove a server: `claude mcp remove <name> -s local`
- View server details: `claude mcp get <name>`

## Docker Commands

- Start all services: `docker compose up -d`
- Stop all services: `docker compose down`
- View logs: `docker compose logs -f <service-name>`
- Rebuild images: `docker compose build --no-cache`