#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

case "$1" in
    build)
        echo "Building Docker images..."
        docker compose build
        ;;
    start)
        echo "Starting MCP servers..."
        docker compose up -d
        ;;
    stop)
        echo "Stopping MCP servers..."
        docker compose down
        ;;
    logs)
        if [ -z "$2" ]; then
            docker compose logs -f
        else
            docker compose logs -f "$2"
        fi
        ;;
    test)
        echo "Testing MCP servers..."
        ./test-servers.sh
        ;;
    list)
        echo "Claude Code MCP servers:"
        claude mcp list
        ;;
    *)
        echo "Usage: $0 {build|start|stop|logs|test|list}"
        echo ""
        echo "Commands:"
        echo "  build  - Build Docker images"
        echo "  start  - Start all MCP servers"
        echo "  stop   - Stop all MCP servers"
        echo "  logs   - View logs (optionally specify service name)"
        echo "  test   - Test all MCP servers"
        echo "  list   - List configured Claude Code MCP servers"
        exit 1
        ;;
esac