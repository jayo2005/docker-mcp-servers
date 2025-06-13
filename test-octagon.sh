#\!/bin/bash
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "octagon-deep-research-agent", "arguments": {"prompt": "test"}}, "id": 1}'  < /dev/null |  docker compose run --rm -i mcp-octagon-deep-research 2>&1
