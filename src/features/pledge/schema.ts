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

/** The college picker's value for "my college isn't listed". */
export const OTHER_COLLEGE = "other";

const CHOOSE_COLLEGE = "Choose your college or school, or pick Other.";
const NAME_COLLEGE = "Enter the name of your college or school.";

/** Shared by the browser (instant feedback) and the Server Action (authority). */
export const PledgeFormSchema = z
  .object({
    name,
    email,
    statements: z
      .array(z.enum(PLEDGE_STATEMENT_IDS))
      .refine(
        (ids) => PLEDGE_STATEMENT_IDS.every((id) => ids.includes(id)),
        "Accept every pledge statement to continue.",
      ),
    is_student: z.boolean(),
    /** A µLearn college id, or OTHER_COLLEGE. Whether the id is listed is checked on the server. */
    college_id: z.union([z.literal(OTHER_COLLEGE), z.guid()], { error: CHOOSE_COLLEGE }).optional(),
    /** The typed name when the college isn't listed. */
    college_other: z
      .string()
      .trim()
      .min(2, NAME_COLLEGE)
      .max(255, "Keep the name under 255 characters.")
      .optional(),
  })
  .superRefine((pledge, ctx) => {
    if (!pledge.is_student) return;
    if (pledge.college_id === undefined) {
      ctx.addIssue({ code: "custom", path: ["college_id"], message: CHOOSE_COLLEGE });
    } else if (pledge.college_id === OTHER_COLLEGE && pledge.college_other === undefined) {
      ctx.addIssue({ code: "custom", path: ["college_other"], message: NAME_COLLEGE });
    }
  });

/**
 * The pledge form's FormData as PledgeFormSchema input. A FormData has no
 * entry for an unticked checkbox and "" for a blank input; college fields
 * only count when the student box is ticked.
 */
export function readPledgeForm(data: FormData) {
  const isStudent = data.get("is_student") === "on";
  const optional = (key: string) => (isStudent ? data.get(key) || undefined : undefined);
  const college_id = optional("college_id");
  const college_other = optional("college_other");

  return {
    name: data.get("name") ?? "",
    email: data.get("email") ?? "",
    statements: data.getAll("statements"),
    is_student: isStudent,
    ...(college_id === undefined ? {} : { college_id }),
    ...(college_other === undefined ? {} : { college_other }),
  };
}

export const LookupFormSchema = z.object({ name, email });
