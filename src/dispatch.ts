import { CreastieApiClient, omitKeys } from "./client.js";
import { getUploadProgress, uploadResumableFile } from "./upload.js";

export async function dispatchTool(
  client: CreastieApiClient,
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "list_subscriptions":
      return client.request("GET", "/subscriptions");
    case "create_subscription":
      return client.request("POST", "/subscriptions", args, { idempotent: true });
    case "update_subscription":
      return client.request(
        "PUT",
        `/subscriptions/${args.id}`,
        omitKeys(args, ["id"]),
      );
    case "delete_subscription":
      return client.request("DELETE", `/subscriptions/${args.id}`);
    case "list_posts":
      return client.request("GET", `/posts${args.page ? `?page=${args.page}` : ""}`);
    case "create_post":
      return client.request("POST", "/posts", args, { idempotent: true });
    case "update_post":
      return client.request("PUT", `/posts/${args.slug}`, omitKeys(args, ["slug"]));
    case "delete_post":
      return client.request("DELETE", `/posts/${args.slug}`);
    case "publish_post":
      return client.request("POST", `/posts/${args.slug}/publish`);
    case "pin_post":
      return client.request("POST", `/posts/${args.slug}/pin`);
    case "unpin_post":
      return client.request("POST", `/posts/${args.slug}/unpin`);
    case "list_comments":
      return client.request("GET", `/comments/${args.slug}`);
    case "create_comment":
      return client.request(
        "POST",
        `/comments/${args.slug}`,
        omitKeys(args, ["slug"]),
        { idempotent: true },
      );
    case "update_comment":
      return client.request("PUT", `/comments/${args.id}`, {
        comment: args.comment,
      });
    case "delete_comment":
      return client.request("DELETE", `/comments/${args.id}`);
    case "set_post_comments_enabled":
      return client.request("PUT", `/posts/${args.slug}`, {
        comments_enabled: args.comments_enabled,
      });
    case "upload_media":
      return uploadResumableFile(client, String(args.path), {
        resumableId: args.resumable_id ? String(args.resumable_id) : undefined,
      });
    case "media_upload_status":
      return getUploadProgress(String(args.resumable_id)) ?? { message: "unknown session" };
    case "list_media":
      return client.request(
        "GET",
        `/my/media/${args.type}${args.page ? `?page=${args.page}` : ""}`,
      );
    case "delete_media":
      return client.request("DELETE", `/my/media/${args.uuid}`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
