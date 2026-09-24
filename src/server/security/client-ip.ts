/**
 * Best-effort client IP for rate limiting.
 *
 * Trusts `x-forwarded-for`/`x-real-ip`, which is correct on Vercel (the edge
 * overwrites them). When self-hosting, the reverse proxy MUST overwrite these
 * headers (nginx: `proxy_set_header X-Forwarded-For $remote_addr;`), or
 * clients can spoof their way around rate limits.
 */
export function getClientIp(headers: Headers): string | undefined {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || undefined;
}
