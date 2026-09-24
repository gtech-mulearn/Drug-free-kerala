import { z } from "zod";

/**
 * Response shapes of https://mulearn.org/api/v1/drugfreekerala/ (FastAPI).
 * Observed 2026-09-24; see docs/audit/2026-09-24-architecture-audit.md.
 */

/** GET total/ → {"total": 5886} */
export const TotalResponse = z.object({
  total: z.number().int().nonnegative(),
});

const PledgeRecord = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().min(1),
  email: z.string(),
});

/**
 * POST create/ → the pledge record. When the email already exists the
 * record of the EXISTING pledge comes back with `is_error: true`.
 */
export const CreateResponse = PledgeRecord.extend({
  is_error: z.boolean().optional(),
});

/**
 * GET get/?email= → the pledge record, or HTTP 200 with
 * {"message": "User not found", "is_error": true}.
 */
export const LookupResponse = z.union([
  PledgeRecord.extend({ is_error: z.literal(false).optional() }),
  z.object({ is_error: z.literal(true), message: z.string() }),
]);
