// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, SECURITY_HEADERS } from "./csp";

const parse = (policy: string) =>
  Object.fromEntries(
    policy.split("; ").map((directive) => {
      const [name, ...sources] = directive.split(" ");
      return [name, sources];
    }),
  ) as Record<string, string[]>;

describe("buildContentSecurityPolicy", () => {
  const production = parse(buildContentSecurityPolicy({ nonce: "abc123", isDev: false, isHttps: true }));
  const development = parse(buildContentSecurityPolicy({ nonce: "abc123", isDev: true, isHttps: false }));
  const plainHttpBuild = parse(buildContentSecurityPolicy({ nonce: "abc123", isDev: false, isHttps: false }));

  it("only runs scripts carrying this request's nonce", () => {
    expect(production["script-src"]).toEqual(["'self'", "'nonce-abc123'", "'strict-dynamic'"]);
  });

  it("never allows inline or eval'd scripts in production", () => {
    expect(production["script-src"]).not.toContain("'unsafe-inline'");
    expect(production["script-src"]).not.toContain("'unsafe-eval'");
  });

  it("allows eval and websockets only in development (React debugging, HMR)", () => {
    expect(development["script-src"]).toContain("'unsafe-eval'");
    expect(development["connect-src"]).toContain("ws:");
    expect(production["connect-src"]).not.toContain("ws:");
  });

  it("blocks framing, plugins and base-tag hijacking", () => {
    expect(production["frame-ancestors"]).toEqual(["'none'"]);
    expect(production["object-src"]).toEqual(["'none'"]);
    expect(production["base-uri"]).toEqual(["'self'"]);
    expect(production["form-action"]).toEqual(["'self'"]);
  });

  it("allows only the third parties the app embeds", () => {
    expect(production["frame-src"]).toEqual(["https://www.youtube-nocookie.com"]);
    expect(production["connect-src"]).toEqual(["'self'"]);
    expect(production["img-src"]).toContain("https://i.ytimg.com");
  });

  it("upgrades insecure requests only on pages served over HTTPS", () => {
    expect(production).toHaveProperty("upgrade-insecure-requests");
    expect(development).not.toHaveProperty("upgrade-insecure-requests");
    expect(plainHttpBuild).not.toHaveProperty("upgrade-insecure-requests");
    expect(plainHttpBuild["script-src"]).not.toContain("'unsafe-eval'");
  });

  it("uses no wildcard sources", () => {
    expect(Object.values(production).flat().filter((source) => source.includes("*"))).toEqual([]);
  });
});

describe("SECURITY_HEADERS", () => {
  it("sets the baseline hardening headers", () => {
    const keys = SECURITY_HEADERS.map((header) => header.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "X-Frame-Options",
        "Referrer-Policy",
        "Permissions-Policy",
      ]),
    );
  });
});
