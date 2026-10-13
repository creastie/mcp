# Creastie MCP

Stdio [MCP](https://modelcontextprotocol.io/) server for the Creastie creator API. Use with Cursor, Claude Desktop, or other MCP clients to manage posts, subscriptions, and comments (migration / blog automation).

## Requirements

- Node.js 20+
- Creastie account
- MCP Personal Access Token from the API: `POST /mcp/tokens` (authenticated)

## Install

```bash
git clone https://github.com/creastie/mcp.git
cd mcp
npm install
npm run build
```

Or run from source during development:

```bash
npm install
npm run dev
```

## Cursor / Claude Desktop config

```json
{
  "mcpServers": {
    "creastie": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/dist/index.js"],
      "env": {
        "CREASTIE_API_URL": "https://api.creastie.com",
        "CREASTIE_API_TOKEN": "your-plaintext-token"
      }
    }
  }
}
```

Never put the token in prompts — only in MCP env config.

## Env

| Variable | Description |
|----------|-------------|
| `CREASTIE_API_URL` | API base URL (e.g. `https://api.creastie.com`) |
| `CREASTIE_API_TOKEN` | Plaintext token from `POST /mcp/tokens` |

## Tools

Subscriptions: `list_subscriptions`, `create_subscription`, `update_subscription`, `delete_subscription`  
Posts: `list_posts`, `create_post`, `update_post`, `delete_post`, `publish_post`, `pin_post`, `unpin_post`  
Comments: `list_comments`, `create_comment`, `update_comment`, `delete_comment`, `set_post_comments_enabled`

Create tools send `Idempotency-Key` automatically.

Token scopes: `mcp` (all) or `mcp:posts` / `mcp:subscriptions` / `mcp:comments`.

## Token API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/mcp/tokens` | List tokens (no plaintext) |
| `POST` | `/mcp/tokens` | Create (`name`, optional `abilities`, `expires_at`) |
| `DELETE` | `/mcp/tokens/{id}` | Revoke |

See Creastie API docs: `docs/user-mcp/` in the API repository.
