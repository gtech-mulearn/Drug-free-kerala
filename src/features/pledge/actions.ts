"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { UpstreamError } from "@/server/mulearn/client";
import { createPledge, findPledge } from "@/server/pledge-service";
import { getClientIp } from "@/server/security/client-ip";
import { getRateLimiter, type RateLimitPolicy } from "@/server/security/rate-limit";
import { LookupFormSchema, PledgeFormSchema } from "./schema";
import type { LookupState, PledgeState } from "./types";

type RateLimited = { status: "rate_limited"; retryAfterSeconds: number };

async function checkRateLimit(policy: RateLimitPolicy): Promise<RateLimited | null> {
  const ip = getClientIp(await headers());
  const limit = await getRateLimiter(policy).check(ip ?? "unknown");
  return limit.allowed ? null : { status: "rate_limited", retryAfterSeconds: limit.retryAfterSeconds };
}

/** Never log names or emails. */
function logFailure(action: string, error: unknown) {
  console.error(
    `[${action}] failed`,
    error instanceof UpstreamError ? error.toLog() : error instanceof Error ? error.name : "unknown error",
  );
}

export async function submitPledge(_previous: PledgeState, formData: FormData): Promise<PledgeState> {
  const parsed = PledgeFormSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    statements: formData.getAll("statements"),
  });
  if (!parsed.success) return { status: "invalid", fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const limited = await checkRateLimit("pledge");
  if (limited) return limited;

  try {
    return await createPledge({ name: parsed.data.name, email: parsed.data.email });
  } catch (error) {
    logFailure("submitPledge", error);
    return { status: "error" };
  }
}

export async function lookupCertificate(_previous: LookupState, formData: FormData): Promise<LookupState> {
  const parsed = LookupFormSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
  });
  if (!parsed.success) return { status: "invalid", fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const limited = await checkRateLimit("lookup");
  if (limited) return limited;

  try {
    return await findPledge(parsed.data);
  } catch (error) {
    logFailure("lookupCertificate", error);
    return { status: "error" };
  }
}
