import { describe, expect, it } from "vitest";
import { createCollegeSearch } from "./college-search";

/** Real titles from µLearn's list (2026-10-10), in the sorted order the server serves. */
const TITLES = [
  "CO-OPERATIVE ARTS & SCIENCE COLLEGE,MADAI, PAZHAYANGADI",
  "GOVERNMENT COLLEGE NEDUMANGAD",
  "GOVT. I.T.I PUZHAKKATTIRI",
  "GOVT.ITI VAYALAR",
  "KERALA UNIVERSITY COLLEGE OF TEACHER EDUCATION, NEDUMANGAD",
  "Model College Madikai",
  "S.N. COLLEGE OF TEACHER EDUCATION, KOTTAPPURAM",
  "SN POLYTECHNIC COLLEGE KANGHANGAD",
  "ST. MARY S PRIVATE INDUSTRIAL TRAINING INSTITUTE, Thrissur",
  "UNIVERSITY INSTITUTE OF TECHNOLOGY, THENMALA",
  "VALAVANNUR BAFAKHY YATHEEMKHANA PVT ITI",
];
const COLLEGES = TITLES.map((title, index) => ({ id: `id-${index}`, title }));

const search = createCollegeSearch(COLLEGES);
const titles = (query: string, limit = 50) => search(query, limit).matches.map((college) => college.title);

describe("createCollegeSearch", () => {
  it("matches every typed word against the start of a word in the title, in any order", () => {
    expect(titles("nedumangad gov")).toEqual(["GOVERNMENT COLLEGE NEDUMANGAD"]);
  });

  it("ignores case, punctuation and non-breaking spaces", () => {
    expect(titles("MODEL college, madikai")).toEqual(["Model College Madikai"]);
  });

  it("treats common abbreviations as the words they stand for", () => {
    expect(titles("govt college")).toEqual(["GOVERNMENT COLLEGE NEDUMANGAD"]);
    expect(titles("government iti")).toEqual(["GOVT. I.T.I PUZHAKKATTIRI", "GOVT.ITI VAYALAR"]);
    expect(titles("private iti")).toEqual(["VALAVANNUR BAFAKHY YATHEEMKHANA PVT ITI"]);
    expect(titles("saint mary")).toEqual(["ST. MARY S PRIVATE INDUSTRIAL TRAINING INSTITUTE, Thrissur"]);
    expect(titles("arts and science")).toEqual(["CO-OPERATIVE ARTS & SCIENCE COLLEGE,MADAI, PAZHAYANGADI"]);
  });

  it("reads initials however they are written", () => {
    expect(titles("sn college")).toEqual([
      "S.N. COLLEGE OF TEACHER EDUCATION, KOTTAPPURAM",
      "SN POLYTECHNIC COLLEGE KANGHANGAD",
    ]);
    expect(titles("s.n. polytechnic")).toEqual(["SN POLYTECHNIC COLLEGE KANGHANGAD"]);
  });

  it("finds a possessive typed without the space µLearn's titles put in it", () => {
    expect(titles("st marys")).toEqual(["ST. MARY S PRIVATE INDUSTRIAL TRAINING INSTITUTE, Thrissur"]);
  });

  it("does not match the middle of a word", () => {
    expect(titles("st")).toEqual(["ST. MARY S PRIVATE INDUSTRIAL TRAINING INSTITUTE, Thrissur"]);
  });

  it("lists titles that start with the query first, then the rest in order", () => {
    expect(titles("university")).toEqual([
      "UNIVERSITY INSTITUTE OF TECHNOLOGY, THENMALA",
      "KERALA UNIVERSITY COLLEGE OF TEACHER EDUCATION, NEDUMANGAD",
    ]);
    expect(titles("college of teacher")).toEqual([
      "KERALA UNIVERSITY COLLEGE OF TEACHER EDUCATION, NEDUMANGAD",
      "S.N. COLLEGE OF TEACHER EDUCATION, KOTTAPPURAM",
    ]);
  });

  it("returns at most `limit` matches, with the total", () => {
    const result = search("college", 2);
    expect(result.matches.map((college) => college.title)).toEqual([
      "CO-OPERATIVE ARTS & SCIENCE COLLEGE,MADAI, PAZHAYANGADI",
      "GOVERNMENT COLLEGE NEDUMANGAD",
    ]);
    expect(result.total).toBe(6);
  });

  it("returns ids with the matches", () => {
    expect(search("vayalar", 50).matches).toEqual([{ id: "id-3", title: "GOVT.ITI VAYALAR" }]);
  });

  it.each(["", "   ", ".,-"])("matches nothing for a query without words (%j)", (query) => {
    expect(search(query, 50)).toEqual({ matches: [], total: 0 });
  });
});
