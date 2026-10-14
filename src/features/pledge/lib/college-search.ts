import type { College } from "../types";

/** Spellings µLearn's titles use interchangeably (GOVT 143×, GOVERNMENT 118×, …). */
const SYNONYMS: Record<string, string> = {
  govt: "government",
  pvt: "private",
  engg: "engineering",
  saint: "st",
};

/**
 * Lower-case words without accents or punctuation, with runs of initials
 * joined ("S.N." and "S N" both become "sn") and abbreviations expanded.
 */
function words(text: string): string[] {
  const plain = text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
  if (!plain) return [];

  const joined: string[] = [];
  let previousWasInitial = false;
  for (const word of plain.split(" ")) {
    const isInitial = word.length === 1;
    if (isInitial && previousWasInitial) joined[joined.length - 1] += word;
    else joined.push(word);
    previousWasInitial = isInitial;
  }
  return joined.map((word) => SYNONYMS[word] ?? word);
}

type Entry = { college: College; key: string; words: string[] };

export type CollegeSearchResult = { matches: College[]; total: number };

/**
 * Indexes the list once and returns a search over it. A college matches when
 * every typed word starts one of its title's words; titles that start with
 * the whole query come first, the rest keep the list's order.
 */
export function createCollegeSearch(colleges: College[]) {
  const entries: Entry[] = colleges.map((college) => {
    const titleWords = words(college.title);
    // Adjacent words joined too, so "marys" finds µLearn's "MARY S".
    const pairs = titleWords.slice(1).map((word, index) => titleWords[index] + word);
    return { college, key: titleWords.join(" "), words: [...titleWords, ...pairs] };
  });

  return function search(query: string, limit: number): CollegeSearchResult {
    const queryWords = words(query);
    if (queryWords.length === 0) return { matches: [], total: 0 };
    const queryKey = queryWords.join(" ");

    const starts: College[] = [];
    const rest: College[] = [];
    for (const entry of entries) {
      if (!queryWords.every((queryWord) => entry.words.some((word) => word.startsWith(queryWord)))) continue;
      (entry.key.startsWith(queryKey) ? starts : rest).push(entry.college);
    }
    return { matches: [...starts, ...rest].slice(0, limit), total: starts.length + rest.length };
  };
}
