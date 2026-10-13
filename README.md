# Creastie MCP

Stdio [MCP](https://modelcontextprotocol.io/)-сервер для API Creastie. Подключается к Cursor, Claude Desktop и другим MCP-клиентам, чтобы через ИИ управлять постами, подписками и комментариями — для миграции контента и автоматизации блога.

## Требования

- Node.js 20+
- Аккаунт Creastie
- MCP Personal Access Token: `POST /mcp/tokens` (нужна авторизация)

## Установка

```bash
git clone https://github.com/creastie/mcp.git
cd mcp
npm install
npm run build
```

Для разработки:

```bash
npm install
npm run dev
```

## Настройка Cursor / Claude Desktop

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

Токен храните только в env MCP-конфига, не в промптах.

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `CREASTIE_API_URL` | Базовый URL API (например `https://api.creastie.com`) |
| `CREASTIE_API_TOKEN` | Plaintext-токен из `POST /mcp/tokens` |

## Инструменты (tools)

Подписки: `list_subscriptions`, `create_subscription`, `update_subscription`, `delete_subscription`  
Посты: `list_posts`, `create_post`, `update_post`, `delete_post`, `publish_post`, `pin_post`, `unpin_post`  
Комментарии: `list_comments`, `create_comment`, `update_comment`, `delete_comment`, `set_post_comments_enabled`

На create клиент сам отправляет `Idempotency-Key`.

Scopes токена: `mcp` (всё) или `mcp:posts` / `mcp:subscriptions` / `mcp:comments`.

## API токенов

| Метод | Path | Описание |
|-------|------|----------|
| `GET` | `/mcp/tokens` | Список токенов (без plaintext) |
| `POST` | `/mcp/tokens` | Создать (`name`, опционально `abilities`, `expires_at`) |
| `DELETE` | `/mcp/tokens/{id}` | Отозвать |

Документация API: `docs/user-mcp/` в репозитории Creastie API.
