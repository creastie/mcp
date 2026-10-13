# Creastie MCP

Сервер [MCP](https://modelcontextprotocol.io/) для Creastie. Подключается к Cursor, Claude Desktop и другим MCP-клиентам, чтобы через ИИ управлять постами, подписками и комментариями — удобно для миграции контента и автоматизации блога.

## Требования

- Node.js 20+
- Аккаунт Creastie
- MCP-токен доступа (выдаётся в Creastie; храните только у себя)

## Установка

```bash
git clone https://github.com/creastie/mcp.git
cd mcp
npm install
npm run build
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
        "CREASTIE_API_TOKEN": "ваш-токен"
      }
    }
  }
}
```

Путь в `args` замените на абсолютный путь к `dist/index.js` после сборки.  
Токен не вставляйте в промпты — только в env MCP-конфига.

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `CREASTIE_API_URL` | Адрес API Creastie (`https://api.creastie.com`) |
| `CREASTIE_API_TOKEN` | Ваш MCP-токен |

## Что умеет

**Подписки:** список, создание, изменение, удаление  
**Посты:** список, создание, изменение, удаление, публикация, закрепление  
**Комментарии:** список, создание, изменение, удаление, вкл/выкл комментариев у поста  

Повторные создания защищены от дублей (идемпотентность на стороне клиента).
