import { randomUUID } from "node:crypto";

export type CreastieClientOptions = {
  baseUrl: string;
  token: string;
};

export class CreastieApiClient {
  constructor(private readonly options: CreastieClientOptions) {}

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    opts?: { idempotent?: boolean; idempotencyKey?: string },
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.options.token}`,
      Accept: "application/json",
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (opts?.idempotent) {
      headers["Idempotency-Key"] = opts.idempotencyKey ?? randomUUID();
    }

    return this.send<T>(method, path, headers, body === undefined ? undefined : JSON.stringify(body));
  }

  /**
   * POST multipart/form-data. Content-Type is intentionally not set so fetch
   * generates the multipart boundary.
   */
  async uploadMultipart<T = unknown>(path: string, formData: FormData): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.options.token}`,
      Accept: "application/json",
    };

    return this.send<T>("POST", path, headers, formData);
  }

  private async send<T>(
    method: string,
    path: string,
    headers: Record<string, string>,
    body: string | FormData | undefined,
  ): Promise<T> {
    const response = await fetch(`${this.options.baseUrl.replace(/\/$/, "")}${path}`, {
      method,
      headers,
      body,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const retryAfter = response.headers.get("Retry-After");
      const message =
        (data && typeof data === "object" && "message" in data
          ? String((data as { message: string }).message)
          : response.statusText) +
        (retryAfter ? ` (Retry-After: ${retryAfter})` : "");
      throw new Error(`HTTP ${response.status}: ${message}`);
    }

    return data as T;
  }
}

/** Drop path params from JSON body so REST validation does not see them. */
export function omitKeys<T extends Record<string, unknown>>(
  input: T,
  keys: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...input };
  for (const key of keys) {
    delete out[key];
  }
  return out;
}
