#!/bin/bash

echo "Testing MCP Docker Servers..."
echo "=============================="

# Test GitHub server
echo -e "\n1. Testing GitHub MCP Server:"
timeout 5s docker compose run --rm mcp-github npx -y @modelcontextprotocol/server-github --help 2>&1 | head -5

# Test Puppeteer server  
echo -e "\n2. Testing Puppeteer MCP Server:"
timeout 5s docker compose run --rm mcp-puppeteer npx -y @modelcontextprotocol/server-puppeteer --help 2>&1 | head -5

# Test Filesystem server
echo -e "\n3. Testing Filesystem MCP Server:"
timeout 5s docker compose run --rm mcp-filesystem npx -y @modelcontextprotocol/server-filesystem --help 2>&1 | head -5

# Test ODOO 17 Paint server
echo -e "\n4. Testing ODOO 17 Paint MCP Server:"
timeout 5s docker compose run --rm mcp-odoo-17-paint npx -y @modelcontextprotocol/server-postgres --help 2>&1 | head -5

# Test Excel server
echo -e "\n5. Testing Excel MCP Server:"
timeout 5s docker compose run --rm mcp-excel npx -y @negokaz/excel-mcp-server --help 2>&1 | head -5

# Test DuckDuckGo server
echo -e "\n6. Testing DuckDuckGo MCP Server:"
timeout 5s docker compose run --rm mcp-duckduckgo npx -y @oevortex/ddg_search --help 2>&1 | head -5

# Test Octagon Deep Research server
echo -e "\n7. Testing Octagon Deep Research MCP Server:"
timeout 5s docker compose run --rm mcp-octagon-deep-research npx -y octagon-deep-research-mcp@latest --help 2>&1 | head -5

# Test WhatsApp server
echo -e "\n8. Testing WhatsApp MCP Server:"
echo '{"jsonrpc": "2.0", "method": "initialize", "params": {"protocolVersion": "2024-11-05", "clientInfo": {"name": "test", "version": "1.0.0"}, "capabilities": {}}, "id": 1}' | timeout 5s docker compose run --rm -i mcp-whatsapp 2>&1 | grep -E "(serverInfo|error)" | head -5

echo -e "\nAll tests completed!"