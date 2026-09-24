import type { Certificate } from "@/features/certificate/types";

type FieldErrors<Field extends string> = Partial<Record<Field, string[]>>;

/** Outcomes shared by both forms. */
type CommonState =
  | { status: "idle" }
  | { status: "rate_limited"; retryAfterSeconds: number }
  | { status: "error" };

export type PledgeState =
  | CommonState
  | { status: "invalid"; fieldErrors: FieldErrors<"name" | "email" | "statements"> }
  | ({ status: "created" | "already_pledged" } & Certificate)
  | { status: "email_taken" };

export type LookupState =
  | CommonState
  | { status: "invalid"; fieldErrors: FieldErrors<"name" | "email"> }
  | ({ status: "found" } & Certificate)
  | { status: "not_found" };

export const IDLE = { status: "idle" } as const;
