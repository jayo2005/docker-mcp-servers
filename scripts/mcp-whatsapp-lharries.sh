#!/bin/bash
# WhatsApp MCP Server (lharries implementation)
cd /home/jason/MCP_SERVERS/whatsapp_lharries/whatsapp-mcp-server

# Make sure UV is in PATH
export PATH=$PATH:$HOME/.local/bin

# Run the Python MCP server
exec uv run main.py