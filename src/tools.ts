const blocksSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      text: { type: "string" },
      media_id: { type: "number" },
      poll_question: { type: "string" },
      poll_options: { type: "array", items: { type: "string" } },
      poll_multiple_select: { type: "boolean" },
      poll_close_at: { type: "string" },
    },
  },
} as const;

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
        poster_id: { type: "number" },
        blocks: blocksSchema,
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
        poster_id: { type: "number" },
        blocks: blocksSchema,
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
  {
    name: "upload_media",
    description: "Upload a local file to media library (resumable chunks)",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        resumable_id: { type: "string" },
      },
      required: ["path"],
    },
  },
  {
    name: "media_upload_status",
    description: "Get progress of a resumable upload session",
    inputSchema: {
      type: "object",
      properties: { resumable_id: { type: "string" } },
      required: ["resumable_id"],
    },
  },
  {
    name: "list_media",
    description: "List own media by type",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["image", "video", "audio", "file"] },
        page: { type: "number" },
      },
      required: ["type"],
    },
  },
  {
    name: "delete_media",
    description: "Delete media by uuid",
    inputSchema: {
      type: "object",
      properties: { uuid: { type: "string" } },
      required: ["uuid"],
    },
  },
  {
    name: "follow",
    description: "Follow a user by nickname",
    inputSchema: {
      type: "object",
      properties: { nickname: { type: "string" } },
      required: ["nickname"],
    },
  },
  {
    name: "unfollow",
    description: "Unfollow a user by nickname",
    inputSchema: {
      type: "object",
      properties: { nickname: { type: "string" } },
      required: ["nickname"],
    },
  },
  {
    name: "list_followers",
    description: "List own followers",
    inputSchema: { type: "object", properties: { page: { type: "number" } } },
  },
  {
    name: "list_follows",
    description: "List users the token owner follows",
    inputSchema: { type: "object", properties: { page: { type: "number" } } },
  },
  {
    name: "list_blacklist",
    description: "List own blacklist (user-level block, not admin ban)",
    inputSchema: { type: "object", properties: { page: { type: "number" } } },
  },
  {
    name: "block_user",
    description: "Add a user to own blacklist (not admin ban)",
    inputSchema: {
      type: "object",
      properties: { blocked_id: { type: "number" } },
      required: ["blocked_id"],
    },
  },
  {
    name: "unblock_user",
    description: "Remove a user from own blacklist by blocked user id",
    inputSchema: {
      type: "object",
      properties: { blocked_id: { type: "number" } },
      required: ["blocked_id"],
    },
  },
  {
    name: "list_donations",
    description: "List donations to the token owner's profile",
    inputSchema: { type: "object", properties: { page: { type: "number" } } },
  },
  {
    name: "list_sold_subscriptions",
    description: "List sold subscriptions",
    inputSchema: { type: "object", properties: { page: { type: "number" } } },
  },
] as const;
