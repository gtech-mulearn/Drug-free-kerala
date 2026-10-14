import "server-only";
import type { College } from "@/features/pledge/types";
import { mulearnRequest } from "@/server/mulearn/client";
import { CollegesResponse } from "@/server/mulearn/schemas";

/** µLearn's college list, sorted by title. Cached for a day in the Next.js data cache. */
export async function getColleges(): Promise<College[]> {
  const { response } = await mulearnRequest("colleges/", CollegesResponse, { api: "register", revalidate: 86400 });
  return response.colleges.sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
}

/** The listed college with this id, or null. The pledge API trusts whatever title we send. */
export async function findCollege(id: string): Promise<College | null> {
  return (await getColleges()).find((college) => college.id === id) ?? null;
}
