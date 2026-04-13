@echo off
set /p PAYLOAD=<commit_payload.json
accio-mcp-cli call COMPOSIO_MULTI_EXECUTE_TOOL --json "%PAYLOAD%"
