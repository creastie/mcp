export const tools = [
  {
    name: "list_subscriptions",
    description: "List own subscription tiers",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_subscription",
    description: "Create subscription tier",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        price: { type: "number" },
        currency: { type: "string" },
        has_chat: { type: "boolean" },
      },
      required: ["title", "price", "currency"],
    },
  },
  {
    name: "update_subscription",
    description: "Update subscription tier",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number" },
        title: { type: "string" },
        description: { type: "string" },
        price: { type: "number" },
        has_chat: { type: "boolean" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_subscription",
    description: "Delete subscription tier",
    inputSchema: {
      type: "object",
      properties: { id: { type: "number" } },
      required: ["id"],
    },
  },
  {
    name: "list_posts",
    description: "List own posts",
    inputSchema: { type: "object", properties: { page: { type: "number" } } },
  },
  {
    name: "create_post",
    description: "Create a post",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        text: { type: "string" },
        price: { type: "number" },
        comments_enabled: { type: "boolean" },
        publish_at: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
      required: ["title", "price"],
    },
  },
  {
    name: "update_post",
    description: "Update a post by slug",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        title: { type: "string" },
        text: { type: "string" },
        comments_enabled: { type: "boolean" },
      },
      required: ["slug"],
    },
  },
  {
    name: "delete_post",
    description: "Delete a post by slug",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "publish_post",
    description: "Publish an existing post now (POST /posts/{slug}/publish)",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "pin_post",
    description: "Pin a post",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "unpin_post",
    description: "Unpin a post",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "list_comments",
    description: "List comments on a post",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "create_comment",
    description: "Create a comment",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        comment: { type: "string" },
        parent_id: { type: "number" },
      },
      required: ["slug", "comment"],
    },
  },
  {
    name: "update_comment",
    description: "Update a comment",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number" },
        comment: { type: "string" },
      },
      required: ["id", "comment"],
    },
  },
  {
    name: "delete_comment",
    description: "Delete a comment",
    inputSchema: {
      type: "object",
      properties: { id: { type: "number" } },
      required: ["id"],
    },
  },
  {
    name: "set_post_comments_enabled",
    description: "Enable/disable comments on a post",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        comments_enabled: { type: "boolean" },
      },
      required: ["slug", "comments_enabled"],
    },
  },
] as const;
