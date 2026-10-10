"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { findCollege } from "@/server/college-service";
import { UpstreamError } from "@/server/mulearn/client";
import { createPledge, findPledge, type StudentAnswer } from "@/server/pledge-service";
import { getClientIp } from "@/server/security/client-ip";
import { getRateLimiter, type RateLimitPolicy } from "@/server/security/rate-limit";
import { LookupFormSchema, OTHER_COLLEGE, PledgeFormSchema, readPledgeForm } from "./schema";
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

const collegeError = (message: string): PledgeState => ({ status: "invalid", fieldErrors: { college_id: [message] } });

/**
 * The student fields for create/. A listed college's title comes from the
 * server's copy of the list, never from the browser.
 */
async function studentAnswer(pledge: z.output<typeof PledgeFormSchema>): Promise<StudentAnswer | PledgeState> {
  const { is_student, college_id, college_other } = pledge;
  if (!is_student) return { is_student: false };
  if (college_id === OTHER_COLLEGE) return { is_student: true, college_name: college_other! };

  try {
    const college = await findCollege(college_id!);
    if (!college) return collegeError("We couldn't find that college. Search again, or pick Other.");
    return { is_student: true, college_id: college.id, college_name: college.title };
  } catch (error) {
    // Don't block the pledge on mulearn.org: "Other" needs no lookup.
    logFailure("submitPledge", error);
    return collegeError("We couldn't check the college list just now. Pick Other and type its name.");
  }
}

export async function submitPledge(_previous: PledgeState, formData: FormData): Promise<PledgeState> {
  const parsed = PledgeFormSchema.safeParse(readPledgeForm(formData));
  if (!parsed.success) return { status: "invalid", fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const limited = await checkRateLimit("pledge");
  if (limited) return limited;

  const student = await studentAnswer(parsed.data);
  if ("status" in student) return student;

  try {
    return await createPledge({ name: parsed.data.name, email: parsed.data.email, ...student });
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
