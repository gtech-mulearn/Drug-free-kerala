import "server-only";
import type { z } from "zod";

/**
 * The production APIs: this campaign's service, and µLearn's registration
 * service (the college list). The env overrides point the server at a local
 * backend or the e2e mock (see .env.example); deployments never set them.
 */
const MULEARN_APIS = {
  drugfreekerala: { url: "https://mulearn.org/api/v1/drugfreekerala/", env: "MULEARN_API_BASE_URL" },
  register: { url: "https://mulearn.org/api/v1/register/", env: "MULEARN_REGISTER_API_BASE_URL" },
} as const;
const DEFAULT_TIMEOUT_MS = 8000;

export type MulearnApi = keyof typeof MULEARN_APIS;

function baseUrl(api: MulearnApi): string {
  const url = process.env[MULEARN_APIS[api].env] || MULEARN_APIS[api].url;
  return url.endsWith("/") ? url : `${url}/`;
}

export type UpstreamErrorKind = "timeout" | "network" | "http" | "invalid_response";

export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly kind: UpstreamErrorKind,
    readonly status?: number,
  ) {
    super(message);
    this.name = "UpstreamError";
  }

  /** Log-safe summary: never includes request bodies (names, emails). */
  toLog() {
    return { kind: this.kind, status: this.status, message: this.message };
  }
}

export type MulearnRequestOptions = {
  /** Which µLearn service `path` is relative to. Defaults to "drugfreekerala". */
  api?: MulearnApi;
  method?: "GET" | "POST";
  query?: Record<string, string>;
  body?: unknown;
  /** Seconds to cache a GET in the Next.js data cache; omit for no caching. */
  revalidate?: number;
  timeoutMs?: number;
};

/**
 * The only function in the app that talks to the µLearn APIs. Enforces a
 * timeout and validates the response shape, so a backend change surfaces as
 * a typed error instead of a crash in the UI.
 */
export async function mulearnRequest<T extends z.ZodType>(
  path: string,
  schema: T,
  options: MulearnRequestOptions = {},
): Promise<z.output<T>> {
  const url = new URL(path.replace(/^\//, ""), baseUrl(options.api ?? "drugfreekerala"));
  for (const [key, value] of Object.entries(options.query ?? {})) url.searchParams.set(key, value);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      ...(options.revalidate === undefined
        ? { cache: "no-store" as const }
        : { next: { revalidate: options.revalidate } }),
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    throw new UpstreamError(
      `${timedOut ? "Timed out" : "Network error"} calling ${url.pathname}`,
      timedOut ? "timeout" : "network",
    );
  }

  if (!response.ok) {
    throw new UpstreamError(`${url.pathname} responded ${response.status}`, "http", response.status);
  }

  const json: unknown = await response.json().catch(() => undefined);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new UpstreamError(`Unexpected response shape from ${url.pathname}`, "invalid_response", response.status);
  }
  return parsed.data;
}
