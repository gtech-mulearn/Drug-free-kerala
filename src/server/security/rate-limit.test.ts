// @vitest-environment node
import { describe, expect, it } from "vitest";
import { RATE_LIMIT_POLICIES, createMemoryRateLimiter } from "./rate-limit";

describe("createMemoryRateLimiter", () => {
  it("allows up to the limit, then blocks with a retry hint", async () => {
    let time = 0;
    const limiter = createMemoryRateLimiter({ limit: 2, windowSeconds: 60, now: () => time });

    expect(await limiter.check("ip")).toEqual({ allowed: true, retryAfterSeconds: 0 });
    expect(await limiter.check("ip")).toEqual({ allowed: true, retryAfterSeconds: 0 });
    time = 15_000;
    expect(await limiter.check("ip")).toEqual({ allowed: false, retryAfterSeconds: 45 });
  });

  it("starts a fresh window once the old one expires", async () => {
    let time = 0;
    const limiter = createMemoryRateLimiter({ limit: 1, windowSeconds: 60, now: () => time });
    await limiter.check("ip");
    expect((await limiter.check("ip")).allowed).toBe(false);
    time = 60_000;
    expect((await limiter.check("ip")).allowed).toBe(true);
  });

  it("tracks keys independently", async () => {
    const limiter = createMemoryRateLimiter({ limit: 1, windowSeconds: 60 });
    await limiter.check("a");
    expect((await limiter.check("a")).allowed).toBe(false);
    expect((await limiter.check("b")).allowed).toBe(true);
  });
});

describe("pledge policy", () => {
  it("lets a full classroom behind one school IP pledge within ten minutes", async () => {
    const limiter = createMemoryRateLimiter(RATE_LIMIT_POLICIES.pledge);
    const results = await Promise.all(Array.from({ length: 60 }, () => limiter.check("school-nat")));
    expect(results.every((r) => r.allowed)).toBe(true);
    expect((await limiter.check("school-nat")).allowed).toBe(false);
  });
});
