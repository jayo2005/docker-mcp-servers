#!/bin/bash

echo "Testing ODOO 17 Paint MCP Server connection to Odoo database..."
echo "============================================"

# Test with a simple query
timeout 10s docker compose run --rm -e DATABASE_URL="postgresql://odoo:Sc00tZujeva@host.docker.internal:5432/postgres" mcp-odoo-17-paint