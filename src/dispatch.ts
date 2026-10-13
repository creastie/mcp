import { CreastieApiClient, omitKeys } from "./client.js";
import { getUploadProgress, uploadResumableFile } from "./upload.js";

function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function enc(value: unknown): string {
  return encodeURIComponent(String(value));
}

type RouteSpec = {
  method: string;
  path: (args: Record<string, unknown>) => string;
  body?: (args: Record<string, unknown>) => unknown;
  idempotent?: boolean;
};

/** Declarative REST mapping for tools that are thin HTTP wrappers. */
const routes: Record<string, RouteSpec> = {
  list_subscriptions: { method: "GET", path: () => "/subscriptions" },
  create_subscription: {
    method: "POST",
    path: () => "/subscriptions",
    body: (args) => args,
    idempotent: true,
  },
  update_subscription: {
    method: "PUT",
    path: (args) => `/subscriptions/${args.id}`,
    body: (args) => omitKeys(args, ["id"]),
  },
  delete_subscription: {
    method: "DELETE",
    path: (args) => `/subscriptions/${args.id}`,
  },
  list_posts: {
    method: "GET",
    path: (args) => `/posts${buildQuery({ page: args.page })}`,
  },
  create_post: {
    method: "POST",
    path: () => "/posts",
    body: (args) => args,
    idempotent: true,
  },
  update_post: {
    method: "PUT",
    path: (args) => `/posts/${args.slug}`,
    body: (args) => omitKeys(args, ["slug"]),
  },
  delete_post: { method: "DELETE", path: (args) => `/posts/${args.slug}` },
  publish_post: { method: "POST", path: (args) => `/posts/${args.slug}/publish` },
  pin_post: { method: "POST", path: (args) => `/posts/${args.slug}/pin` },
  unpin_post: { method: "POST", path: (args) => `/posts/${args.slug}/unpin` },
  list_comments: { method: "GET", path: (args) => `/comments/${args.slug}` },
  create_comment: {
    method: "POST",
    path: (args) => `/comments/${args.slug}`,
    body: (args) => omitKeys(args, ["slug"]),
    idempotent: true,
  },
  update_comment: {
    method: "PUT",
    path: (args) => `/comments/${args.id}`,
    body: (args) => ({ comment: args.comment }),
  },
  delete_comment: { method: "DELETE", path: (args) => `/comments/${args.id}` },
  set_post_comments_enabled: {
    method: "PUT",
    path: (args) => `/posts/${args.slug}`,
    body: (args) => ({ comments_enabled: args.comments_enabled }),
  },
  list_media: {
    method: "GET",
    path: (args) => `/my/media/${args.type}${buildQuery({ page: args.page })}`,
  },
  delete_media: { method: "DELETE", path: (args) => `/my/media/${args.uuid}` },
  follow: {
    method: "POST",
    path: (args) => `/users/${enc(args.nickname)}/follow`,
  },
  unfollow: {
    method: "DELETE",
    path: (args) => `/users/${enc(args.nickname)}/follow`,
  },
  list_followers: {
    method: "GET",
    path: (args) => `/followers${buildQuery({ page: args.page })}`,
  },
  list_follows: {
    method: "GET",
    path: (args) => `/follows${buildQuery({ page: args.page })}`,
  },
  list_blacklist: {
    method: "GET",
    path: (args) => `/blacklist${buildQuery({ page: args.page })}`,
  },
  block_user: {
    method: "POST",
    path: () => "/blacklist",
    body: (args) => ({ blocked_id: args.blocked_id }),
  },
  unblock_user: {
    method: "DELETE",
    path: (args) => `/blacklist/${args.blocked_id}`,
  },
  list_donations: {
    method: "GET",
    path: (args) => `/donations${buildQuery({ page: args.page })}`,
  },
  list_sold_posts: {
    method: "GET",
    path: (args) => `/sold-posts${buildQuery({ page: args.page })}`,
  },
  list_sold_subscriptions: {
    method: "GET",
    path: (args) => `/sold-subscriptions${buildQuery({ page: args.page })}`,
  },
};

export async function dispatchTool(
  client: CreastieApiClient,
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  if (name === "upload_media") {
    return uploadResumableFile(client, String(args.path), {
      resumableId: args.resumable_id ? String(args.resumable_id) : undefined,
    });
  }

  if (name === "media_upload_status") {
    return getUploadProgress(String(args.resumable_id)) ?? { message: "unknown session" };
  }

  const route = routes[name];
  if (!route) {
    throw new Error(`Unknown tool: ${name}`);
  }

  return client.request(
    route.method,
    route.path(args),
    route.body ? route.body(args) : undefined,
    route.idempotent ? { idempotent: true } : undefined,
  );
}
