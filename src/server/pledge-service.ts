import "server-only";
import { formatCertificateId } from "@/features/certificate/lib/certificate-id";
import type { Certificate } from "@/features/certificate/types";
import { mulearnRequest } from "@/server/mulearn/client";
import { CreateResponse, LookupResponse, TotalResponse } from "@/server/mulearn/schemas";

export type PledgeInput = { name: string; email: string };

export type CreatePledgeOutcome =
  | ({ status: "created" } & Certificate)
  | ({ status: "already_pledged" } & Certificate)
  /** The email already pledged under a different name. Reveal nothing about it. */
  | { status: "email_taken" };

export type FindPledgeOutcome = ({ status: "found" } & Certificate) | { status: "not_found" };

/** Case-, width- and whitespace-insensitive comparison of personal names. */
function namesMatch(stored: string, submitted: string): boolean {
  const normalise = (name: string) =>
    name.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-IN");
  return normalise(stored) === normalise(submitted);
}

/** Total pledges, cached for 30 s in the Next.js data cache. */
export async function getPledgeTotal(): Promise<number> {
  const { total } = await mulearnRequest("total/", TotalResponse, { revalidate: 30, timeoutMs: 3000 });
  return total;
}

export async function createPledge(input: PledgeInput): Promise<CreatePledgeOutcome> {
  const record = await mulearnRequest("create/", CreateResponse, { method: "POST", body: input });
  const certificate = { certificateId: formatCertificateId(record.id), name: record.name };

  if (!record.is_error) return { status: "created", ...certificate };

  // The API returns the EXISTING pledge for a duplicate email. Only hand it
  // back to someone who also knows the name it was made under.
  return namesMatch(record.name, input.name) ? { status: "already_pledged", ...certificate } : { status: "email_taken" };
}

export async function findPledge(input: PledgeInput): Promise<FindPledgeOutcome> {
  const result = await mulearnRequest("get/", LookupResponse, { query: { email: input.email } });
  if (result.is_error === true) return { status: "not_found" };

  // A name mismatch is indistinguishable from "no pledge" to the caller.
  return namesMatch(result.name, input.name)
    ? { status: "found", certificateId: formatCertificateId(result.id), name: result.name }
    : { status: "not_found" };
}
