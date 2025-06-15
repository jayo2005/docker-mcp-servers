#!/usr/bin/env python3
"""
MCP Server Coordinator Agent - Enhanced Version
Manages all MCP servers and responds to both issues and comments
"""

import os
import json
import logging
from datetime import datetime, timedelta
from github import Github
import base64

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MCPServerCoordinatorEnhanced:
    def __init__(self):
        self.github_token = os.environ.get('GITHUB_TOKEN')
        if not self.github_token:
            raise ValueError("GITHUB_TOKEN environment variable not set")
        
        self.g = Github(self.github_token)
        
        # MCP Server inventory (same as before)
        self.mcp_servers = {
            'filesystem': {
                'description': 'File system access with read-only access to /home/jason',
                'capabilities': ['read files', 'list directories', 'search files', 'file metadata'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-filesystem.sh'
            },
            'github': {
                'description': 'GitHub API integration for repository management',
                'capabilities': ['create/read repos', 'manage issues', 'pull requests', 'commits'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-github.sh'
            },
            'postgres': {
                'name': 'ODOO_17_paint',
                'description': 'PostgreSQL for Odoo 17 database access',
                'capabilities': ['read-only SQL queries', 'schema info', 'data analysis'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-odoo-17-paint.sh'
            },
            'puppeteer': {
                'description': 'Browser automation using Puppeteer',
                'capabilities': ['navigate pages', 'screenshots', 'form filling', 'web scraping'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-puppeteer.sh'
            },
            'excel': {
                'description': 'Excel file manipulation',
                'capabilities': ['read/write Excel', 'create spreadsheets', 'formulas'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-excel.sh'
            },
            'duckduckgo': {
                'description': 'DuckDuckGo search without tracking',
                'capabilities': ['web search', 'image search', 'news search', 'instant answers'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-duckduckgo.sh'
            },
            'octagon-deep-research': {
                'description': 'AI-powered comprehensive research',
                'capabilities': ['unlimited queries', 'deep analysis', 'research synthesis'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-octagon-deep-research.sh'
            },
            'whatsapp': {
                'description': 'WhatsApp Cloud API for messaging',
                'capabilities': ['send messages', 'templates', 'media files', 'webhooks'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-whatsapp.sh'
            },
            'sage_mssql': {
                'description': 'Microsoft SQL Server for Sage/AdvanceCoatings',
                'capabilities': ['read-only queries', '400+ Sage tables', 'data analysis'],
                'connection': '192.168.20.188 / AdvanceCoatings',
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-sage-mssql.sh'
            },
            'odoo_mcp': {
                'description': 'Universal Odoo MCP for versions 12-17+',
                'capabilities': ['full API access', 'CRUD operations', 'custom methods'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-odoo-mcp.sh'
            },
            'odoo16': {
                'description': 'Dedicated Odoo v16 instance',
                'capabilities': ['XML-RPC API', 'demo_theme4 database', 'port 10016'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-odoo16.sh'
            },
            'odoo17': {
                'description': 'Dedicated Odoo v17 instance',
                'capabilities': ['XML-RPC API', 'inter2 database', 'port 8069'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-odoo17.sh'
            },
            'wordpress': {
                'description': 'WordPress REST API access',
                'capabilities': ['posts/pages', 'media', 'users', 'categories'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-wordpress.sh'
            },
            'elementor': {
                'description': 'Elementor page builder for WordPress',
                'capabilities': ['page creation', 'widgets', 'templates', 'responsive design'],
                'script': '/home/jason/MCP_SERVERS/scripts/mcp-elementor.sh'
            }
        }
    
    def analyze_text_for_mcp(self, text):
        """Analyze any text for MCP-related questions"""
        text_lower = text.lower()
        
        # Check for specific questions about servers
        if 'filesystem' in text_lower and any(word in text_lower for word in ['what', 'does', 'safe', 'can']):
            return self.explain_filesystem_server()
        
        elif 'cross_repo_token' in text_lower or 'cross-repo' in text_lower:
            return self.explain_cross_repo_token()
        
        elif any(word in text_lower for word in ['permission', 'access denied', 'connection', 'error']):
            return self.handle_permission_issue("", text)
        
        elif any(word in text_lower for word in ['available', 'list', 'what mcp', 'which servers']):
            return self.list_available_servers()
        
        elif any(word in text_lower for word in ['setup', 'configure', 'install']):
            return self.handle_setup_request("", text)
        
        elif any(word in text_lower for word in ['sage', 'mssql', 'sql server']):
            return self.provide_sage_guidance()
        
        elif any(word in text_lower for word in ['odoo', 'xml-rpc', 'api']):
            return self.provide_odoo_guidance()
        
        else:
            return self.general_mcp_response(text)
    
    def explain_filesystem_server(self):
        """Explain the filesystem MCP server"""
        return """## 📁 Filesystem MCP Server Explained

### What is it?
The filesystem MCP server provides **read-only** access to files and directories on the system, specifically restricted to `/home/jason`.

### Is it safe?
✅ **YES, it's safe!** Here's why:
- **Read-only**: Cannot modify, delete, or create files
- **Path restricted**: Only accesses `/home/jason` directory
- **Dockerized**: Runs in isolated container
- **No sensitive data**: Cannot access system files or other users' data

### What can it do?
1. **List directories** - See folder contents
2. **Read files** - View file contents
3. **Search files** - Find files by name/pattern
4. **Get metadata** - File sizes, dates, permissions

### Common uses:
- Browse project files
- Read configuration files
- Search for specific code
- Check file existence
- View documentation

### Example operations:
```json
// List directory contents
{
  "tool": "list_directory",
  "path": "/home/jason/Paint_Agents"
}

// Read a file
{
  "tool": "read_file",
  "path": "/home/jason/Paint_Agents/README.md"
}
```

### Security features:
- Cannot execute files
- Cannot access passwords or secrets
- Cannot modify anything
- Respects file permissions

---
*The filesystem MCP is a safe, useful tool for navigating project files*"""
    
    def explain_cross_repo_token(self):
        """Explain CROSS_REPO_TOKEN vs GitHub MCP"""
        return """## 🔐 CROSS_REPO_TOKEN Clarification

### Important Update: You DON'T need CROSS_REPO_TOKEN!

The GitHub MCP server handles all cross-repository operations using just the `GITHUB_TOKEN`.

### What changed?
- **OLD**: Agents used PyGithub library → needed CROSS_REPO_TOKEN
- **NEW**: GitHub MCP server → uses GITHUB_TOKEN for everything

### Current status:
✅ **GitHub MCP server** - Handles all cross-repo operations
✅ **GITHUB_TOKEN** - The only token needed (already in .env)
❌ **CROSS_REPO_TOKEN** - Not needed anymore!

### For developers:
If you see CROSS_REPO_TOKEN in any documentation or code:
1. It's outdated
2. Replace with GitHub MCP tools
3. Use GITHUB_TOKEN only

### Available GitHub MCP tools:
- Create issues in ANY repository
- Read/comment across repos
- Manage pull requests
- Full GitHub API access

### Example:
```json
// Works across ANY repository you have access to!
{
  "tool": "github",
  "function": "create_issue",
  "parameters": {
    "owner": "jayo2005",
    "repo": "any-repo-name",
    "title": "Cross-repo issue",
    "body": "This works!"
  }
}
```

---
*Updated based on latest GitHub MCP capabilities*"""
    
    def handle_permission_issue(self, title, body):
        """Handle MCP permission and connection issues"""
        return f"""## 🛠️ MCP Server Coordinator Response - Troubleshooting

### Common MCP Server Issues:

#### 1. Permission Denied
- Check Docker container permissions
- Ensure proper file ownership: `chown -R mcpuser:mcpuser /app`
- Verify environment variables in `.env` file

#### 2. Connection Refused
- Verify server is running: `docker compose ps`
- Check logs: `docker compose logs -f <service-name>`
- For Odoo/SQL: Use `host.docker.internal` not `localhost`

#### 3. Authentication Failed
- **Odoo**: Use user login (email), not "admin"
- **SQL Server**: Ensure SQL auth is enabled
- **WordPress**: Check application password

### Quick Diagnostics:
```bash
# Test MCP server
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | ./scripts/mcp-<server>.sh

# Check Docker status
docker compose ps

# View logs
docker compose logs -f mcp-<server>
```

### Need More Help?
Please provide:
1. Which MCP server is failing
2. Exact error message
3. What operation you're trying

---
*MCP Server Coordinator - Here to help with all MCP issues*"""
    
    def list_available_servers(self):
        """List all available MCP servers"""
        server_list = "## 🌐 Available MCP Servers (14 Total)\n\n"
        
        categories = {
            'Core Services': ['filesystem', 'github', 'puppeteer', 'excel', 'duckduckgo'],
            'Research & Communication': ['octagon-deep-research', 'whatsapp'],
            'Database Access': ['postgres', 'sage_mssql'],
            'Odoo Integration': ['odoo_mcp', 'odoo16', 'odoo17'],
            'WordPress/Web': ['wordpress', 'elementor']
        }
        
        for category, servers in categories.items():
            server_list += f"### {category}\n"
            for server in servers:
                if server in self.mcp_servers:
                    info = self.mcp_servers[server]
                    name = info.get('name', server)
                    server_list += f"- **{name}**: {info['description']}\n"
            server_list += "\n"
        
        server_list += """### Quick Registration:
```bash
# Register all servers at once
claude mcp add filesystem /home/jason/MCP_SERVERS/scripts/mcp-filesystem.sh
claude mcp add github /home/jason/MCP_SERVERS/scripts/mcp-github.sh
# ... (see full list in docker-mcp-servers/README.md)
```

### Agent-Specific MCP Usage:
- **sage-agent**: sage_mssql, filesystem, github
- **odoo-agent**: odoo_mcp, odoo16, odoo17, postgres, puppeteer, github
- **tikkurila-agent**: postgres, filesystem, github
- **woocommerce-agent**: wordpress, elementor, github
- **project-manager**: github, filesystem

---
*MCP Server Coordinator - Managing 14 MCP servers*"""
        
        return server_list
    
    def provide_sage_guidance(self):
        """Provide Sage MSSQL specific guidance"""
        return """## 🗄️ Sage MSSQL Server Guide

### Connection Details:
- **Server**: 192.168.20.188
- **Database**: AdvanceCoatings
- **Auth**: sa / Sc00tZujeva
- **Port**: 1433

### Available Tables (400+):
- StockItem - Product inventory
- Customer - Customer records
- Supplier - Supplier information
- BillOfMaterial - BoM data
- And many more Sage tables

### Common Queries:
```sql
-- List all tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES

-- Get product info
SELECT * FROM StockItem WHERE Code LIKE 'PAINT%'

-- Check BoM
SELECT * FROM BillOfMaterial WHERE ParentItemCode = 'ABC123'
```

### Troubleshooting:
1. **Connection timeout**: Check firewall for port 1433
2. **Auth failed**: Verify SQL Server authentication enabled
3. **Permission denied**: Check sa account is enabled

---
*Use sage_mssql MCP server for Sage data access*"""
    
    def provide_odoo_guidance(self):
        """Provide Odoo MCP specific guidance"""
        return """## 🏢 Odoo MCP Server Guide

### Available Odoo Servers:

#### 1. Universal Odoo MCP (`odoo_mcp`)
- Works with any Odoo version (12-17+)
- Full XML-RPC/JSON-RPC access
- Configure with your instance details

#### 2. Odoo 16 (`odoo16`)
- Port: 10016 (Docker)
- Database: demo_theme4
- Login: info@softcroft.ie / Sc00tZujeva

#### 3. Odoo 17 (`odoo17`)
- Port: 8069 (Native)
- Database: inter2
- Login: info@softcroft.ie / Sc00tZujeva

### Configuration (.env):
```bash
ODOO17_URL=http://host.docker.internal:8069
ODOO17_DB=inter2
ODOO17_USER=info@softcroft.ie
ODOO17_PASSWORD=Sc00tZujeva
```

### Common Operations:
```json
// Search products
{
  "method": "tools/call",
  "params": {
    "name": "search_read",
    "arguments": {
      "model": "product.template",
      "fields": ["name", "list_price"],
      "limit": 10
    }
  }
}
```

### Troubleshooting:
- Use email for login, not "admin"
- Password is user password, not master password
- Use exact database name from selector

---
*Choose the right Odoo MCP for your needs*"""
    
    def general_mcp_response(self, text):
        """General MCP guidance"""
        return f"""## 🛠️ MCP Server Coordinator Response

### Analyzing your request...

I can help with:
- 🔧 Server setup and configuration
- 🔐 Permission and access issues
- 📋 Available server documentation
- 🤝 Agent-to-MCP integration
- 🐛 Troubleshooting errors

### Quick Commands:
```bash
# List your MCP servers
claude mcp list

# Test a server
./scripts/test-servers.sh

# View Docker status
docker compose ps
```

### Common Tasks:
1. **Add new MCP server**: I'll guide you through setup
2. **Fix connection issues**: Provide error details
3. **Configure for agents**: Tell me which agent needs help
4. **Performance optimization**: Which server is slow?

Please provide more details about your MCP-related need!

---
*MCP Server Coordinator - Your MCP infrastructure support*"""
    
    def process_mcp_issues_and_comments(self):
        """Monitor all repositories for MCP-related issues AND comments"""
        repos_to_monitor = [
            'jayo2005/paint-sage-operations',
            'jayo2005/paint-odoo-operations',
            'jayo2005/paint-tikkurila-operations',
            'jayo2005/paint-woocommerce-operations',
            'jayo2005/paint-project-orchestration',
            'jayo2005/docker-mcp-servers'
        ]
        
        # Track what we've already responded to
        responded_comments = set()
        
        for repo_name in repos_to_monitor:
            try:
                repo = self.g.get_repo(repo_name)
                
                # Process open issues
                for issue in repo.get_issues(state='open'):
                    labels = [l.name for l in issue.labels]
                    
                    # Check for new comments since last check
                    # Look for comments in the last hour
                    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
                    
                    for comment in issue.get_comments():
                        # Skip if too old
                        if comment.created_at < one_hour_ago:
                            continue
                        
                        # Skip if we've already responded
                        comment_id = f"{repo_name}#{issue.number}#{comment.id}"
                        if comment_id in responded_comments:
                            continue
                        
                        # Skip our own comments
                        if 'MCP Server Coordinator' in comment.body:
                            continue
                        
                        # Check if comment is MCP-related
                        comment_lower = comment.body.lower()
                        issue_title_lower = issue.title.lower()
                        
                        mcp_keywords = ['mcp', 'server', 'filesystem', 'permission', 'docker', 
                                       'connection', 'xml-rpc', 'api', 'access denied', 'puppeteer', 
                                       'mssql', 'cross_repo_token', 'cross-repo']
                        
                        if any(keyword in comment_lower for keyword in mcp_keywords):
                            logger.info(f"Found MCP-related comment in {repo_name} #{issue.number}")
                            
                            # Analyze and respond
                            response = self.analyze_text_for_mcp(comment.body)
                            issue.create_comment(response)
                            responded_comments.add(comment_id)
                            
                            logger.info(f"Responded to comment in {repo_name} #{issue.number}")
                    
                    # Also check if the issue itself needs a response
                    if 'mcp-responded' not in labels:
                        title_lower = issue.title.lower()
                        body_lower = issue.body.lower() if issue.body else ""
                        
                        if any(keyword in title_lower + ' ' + body_lower for keyword in mcp_keywords):
                            logger.info(f"Found MCP issue in {repo_name} #{issue.number}")
                            
                            # Analyze and respond
                            response = self.analyze_text_for_mcp(issue.title + " " + (issue.body or ""))
                            issue.create_comment(response)
                            
                            # Mark as responded
                            try:
                                issue.add_to_labels('mcp-responded')
                            except:
                                pass
                        
            except Exception as e:
                logger.error(f"Error checking {repo_name}: {e}")
    
    def handle_setup_request(self, title, body):
        """Handle MCP setup requests"""
        return """## 🚀 MCP Server Setup Guide

### Quick Start:
1. **Clone the repository**:
   ```bash
   git clone https://github.com/jayo2005/docker-mcp-servers.git
   cd docker-mcp-servers
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start servers**:
   ```bash
   docker compose up -d
   ```

4. **Register with Claude**:
   ```bash
   # One by one
   claude mcp add github /home/jason/MCP_SERVERS/scripts/mcp-github.sh
   
   # Or use the register script
   ./scripts/register-all.sh
   ```

### Server-specific setup:
- **Odoo**: Add database credentials to .env
- **SQL Server**: Enable SQL authentication
- **WordPress**: Generate application password
- **WhatsApp**: Add Cloud API token

---
*Need help with a specific server? Just ask!*"""

def main():
    """Main entry point"""
    try:
        coordinator = MCPServerCoordinatorEnhanced()
        logger.info("MCP Server Coordinator Enhanced starting...")
        
        # Process MCP-related issues AND comments
        coordinator.process_mcp_issues_and_comments()
        
        logger.info("MCP Server Coordinator Enhanced completed")
        
    except Exception as e:
        logger.error(f"MCP Coordinator error: {e}")
        raise

if __name__ == "__main__":
    main()