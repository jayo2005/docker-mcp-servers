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

### Sage_MSSQL
Microsoft SQL Server database server for Sage/AdvanceCoatings access. This server enables Claude to:
- Execute read-only SQL queries on MSSQL databases
- List all tables in the database
- Describe table schemas and column information
- Query data from Sage accounting and AdvanceCoatings tables
- Perform data analysis on MSSQL database contents
- Connect to MSSQL Server at 192.168.20.188

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
- **ODOO16**: Connect to your Odoo v16 instance
- **ODOO17**: Connect to your Odoo v17 instance
- Run both servers simultaneously for migration tasks
- Compare data between versions
- Each server has independent credentials and connection settings
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