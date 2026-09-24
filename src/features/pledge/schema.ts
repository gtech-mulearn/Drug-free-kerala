import { z } from "zod";
import { PLEDGE_STATEMENT_IDS } from "./content";

/** Letters and combining marks in any script (Malayalam included), plus . ' ’ - and spaces. */
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;

const name = z
  .string()
  .trim()
  .min(2, "Enter your full name.")
  .max(80, "Keep your name under 80 characters.")
  .regex(NAME_PATTERN, "Use letters, spaces and . ' - only.");

const email = z
  .string()
  .trim()
  .max(254, "That email address is too long.")
  .pipe(z.email("Enter a valid email address."));

/** Shared by the browser (instant feedback) and the Server Action (authority). */
export const PledgeFormSchema = z.object({
  name,
  email,
  statements: z
    .array(z.enum(PLEDGE_STATEMENT_IDS))
    .refine((ids) => PLEDGE_STATEMENT_IDS.every((id) => ids.includes(id)), "Accept every pledge statement to continue."),
});

export const LookupFormSchema = z.object({ name, email });
