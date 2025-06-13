#!/bin/bash

# Load the API key from .env
source .env

echo "Testing Octagon API directly..."
echo "API Key (first 20 chars): ${OCTAGON_API_KEY:0:20}..."

# Test the API directly with curl
curl -X POST https://octagon-production.up.railway.app/v1/chat/completions \
  -H "Authorization: Bearer $OCTAGON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Say hello"}],
    "temperature": 0.7
  }' \
  -w "\nHTTP Status: %{http_code}\n"