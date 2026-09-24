/**
 * Content Security Policy, applied per request by src/proxy.ts.
 *
 * Scripts: nonce + 'strict-dynamic'. Only scripts Next.js renders with this
 * request's nonce (and scripts they load) may run.
 * Styles: 'unsafe-inline' is required. next/image and React write inline
 * style attributes and Sonner injects a <style> tag; a nonce would make
 * browsers ignore 'unsafe-inline'. Styles cannot execute code.
 */
export const CSP_SOURCES = {
  youtubeEmbed: "https://www.youtube-nocookie.com",
  youtubeThumbnails: "https://i.ytimg.com",
} as const;

export type CspOptions = {
  nonce: string;
  isDev: boolean;
  /** Emit upgrade-insecure-requests (only meaningful on pages served over HTTPS). */
  isHttps: boolean;
};

export function buildContentSecurityPolicy({ nonce, isDev, isHttps }: CspOptions): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", CSP_SOURCES.youtubeThumbnails],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...(isDev ? ["ws:"] : [])],
    "frame-src": [CSP_SOURCES.youtubeEmbed],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    ...(isHttps ? { "upgrade-insecure-requests": [] } : {}),
  };

  return Object.entries(directives)
    .map(([directive, sources]) => [directive, ...sources].join(" "))
    .join("; ");
}

/** Headers for every response (see next.config.ts). */
export const SECURITY_HEADERS: ReadonlyArray<{ key: string; value: string }> = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];
