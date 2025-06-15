# MCP Servers List - Quick Reference

## Available MCP Servers (16 Total)

### How to Add/Remove MCP Servers

**To Add a Server to Your Project:**
```bash
claude mcp add <server-name> <path-to-script>
```

**To Remove a Server from Your Project:**
```bash
claude mcp remove <server-name>
```

**To List All Registered Servers:**
```bash
claude mcp list
```

---

## 🔧 Core Servers

### 1. filesystem
- **Description**: Read-only access to /home/jason
- **Add**: `claude mcp add filesystem /home/jason/MCP_SERVERS/scripts/mcp-filesystem.sh`
- **Remove**: `claude mcp remove filesystem`

### 2. github
- **Description**: GitHub API access (28 tools)
- **Add**: `claude mcp add github /home/jason/MCP_SERVERS/scripts/mcp-github.sh`
- **Remove**: `claude mcp remove github`

### 3. puppeteer
- **Description**: Browser automation
- **Add**: `claude mcp add puppeteer /home/jason/MCP_SERVERS/scripts/mcp-puppeteer.sh`
- **Remove**: `claude mcp remove puppeteer`

### 4. excel
- **Description**: Excel file manipulation
- **Add**: `claude mcp add excel /home/jason/MCP_SERVERS/scripts/mcp-excel.sh`
- **Remove**: `claude mcp remove excel`

### 5. duckduckgo
- **Description**: Web search (4 tools)
- **Add**: `claude mcp add duckduckgo /home/jason/MCP_SERVERS/scripts/mcp-duckduckgo.sh`
- **Remove**: `claude mcp remove duckduckgo`

### 6. octagon-deep-research
- **Description**: AI-powered deep research
- **Add**: `claude mcp add octagon-deep-research /home/jason/MCP_SERVERS/scripts/mcp-octagon-deep-research.sh`
- **Remove**: `claude mcp remove octagon-deep-research`

### 7. whatsapp
- **Description**: WhatsApp Cloud API (8 tools)
- **Add**: `claude mcp add whatsapp /home/jason/MCP_SERVERS/scripts/mcp-whatsapp.sh`
- **Remove**: `claude mcp remove whatsapp`

---

## 🗄️ Database Servers

### 8. ODOO_17_paint
- **Description**: PostgreSQL/Odoo 17 direct SQL
- **Add**: `claude mcp add ODOO_17_paint /home/jason/MCP_SERVERS/scripts/mcp-odoo-17-paint.sh`
- **Remove**: `claude mcp remove ODOO_17_paint`

### 9. Sage_MSSQL
- **Description**: Microsoft SQL Server for Sage
- **Add**: `claude mcp add Sage_MSSQL /home/jason/MCP_SERVERS/scripts/mcp-sage-mssql.sh`
- **Remove**: `claude mcp remove Sage_MSSQL`

### 10. mysql-tikkurila
- **Description**: MySQL for Tikkurila paint (dual DB)
- **Add**: `claude mcp add mysql-tikkurila /home/jason/MCP_SERVERS/scripts/mcp-mysql-tikkurila.sh`
- **Remove**: `claude mcp remove mysql-tikkurila`

### 11. magento-mysql
- **Description**: MySQL for Magento e-commerce
- **Add**: `claude mcp add magento-mysql /home/jason/MCP_SERVERS/scripts/mcp-magento-mysql.sh`
- **Remove**: `claude mcp remove magento-mysql`

---

## 🏢 Odoo API Servers

### 12. ODOO_MCP
- **Description**: Universal Odoo API (v12-v17+)
- **Add**: `claude mcp add ODOO_MCP /home/jason/MCP_SERVERS/scripts/mcp-odoo-mcp.sh`
- **Remove**: `claude mcp remove ODOO_MCP`

### 13. ODOO16
- **Description**: Odoo v16 API access
- **Add**: `claude mcp add ODOO16 /home/jason/MCP_SERVERS/scripts/mcp-odoo16.sh`
- **Remove**: `claude mcp remove ODOO16`

### 14. ODOO17
- **Description**: Odoo v17 API access
- **Add**: `claude mcp add ODOO17 /home/jason/MCP_SERVERS/scripts/mcp-odoo17.sh`
- **Remove**: `claude mcp remove ODOO17`

---

## 🌐 WordPress/Web Development

### 15. wordpress
- **Description**: WordPress REST API
- **Add**: `claude mcp add wordpress /home/jason/MCP_SERVERS/scripts/mcp-wordpress.sh`
- **Remove**: `claude mcp remove wordpress`

### 16. elementor
- **Description**: Elementor page builder
- **Add**: `claude mcp add elementor /home/jason/MCP_SERVERS/scripts/mcp-elementor.sh`
- **Remove**: `claude mcp remove elementor`

---

## 📝 Quick Tips

1. **MCP servers are registered per-project** - You need to add them in each project directory
2. **Check what's registered**: Run `claude mcp list` in your project
3. **Remove all servers**: There's no bulk remove, remove each one individually
4. **After adding/removing**: Refresh Claude Code or restart for changes to take effect

## 🚀 Add All Servers at Once

Copy and run this script to add all servers:

```bash
#!/bin/bash
# Add all MCP servers to current project

claude mcp add filesystem /home/jason/MCP_SERVERS/scripts/mcp-filesystem.sh
claude mcp add github /home/jason/MCP_SERVERS/scripts/mcp-github.sh
claude mcp add puppeteer /home/jason/MCP_SERVERS/scripts/mcp-puppeteer.sh
claude mcp add excel /home/jason/MCP_SERVERS/scripts/mcp-excel.sh
claude mcp add duckduckgo /home/jason/MCP_SERVERS/scripts/mcp-duckduckgo.sh
claude mcp add octagon-deep-research /home/jason/MCP_SERVERS/scripts/mcp-octagon-deep-research.sh
claude mcp add whatsapp /home/jason/MCP_SERVERS/scripts/mcp-whatsapp.sh
claude mcp add ODOO_17_paint /home/jason/MCP_SERVERS/scripts/mcp-odoo-17-paint.sh
claude mcp add Sage_MSSQL /home/jason/MCP_SERVERS/scripts/mcp-sage-mssql.sh
claude mcp add mysql-tikkurila /home/jason/MCP_SERVERS/scripts/mcp-mysql-tikkurila.sh
claude mcp add magento-mysql /home/jason/MCP_SERVERS/scripts/mcp-magento-mysql.sh
claude mcp add ODOO_MCP /home/jason/MCP_SERVERS/scripts/mcp-odoo-mcp.sh
claude mcp add ODOO16 /home/jason/MCP_SERVERS/scripts/mcp-odoo16.sh
claude mcp add ODOO17 /home/jason/MCP_SERVERS/scripts/mcp-odoo17.sh
claude mcp add wordpress /home/jason/MCP_SERVERS/scripts/mcp-wordpress.sh
claude mcp add elementor /home/jason/MCP_SERVERS/scripts/mcp-elementor.sh
```