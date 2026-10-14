"use client";

import { useEffect, useId, useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { FormField, Input, Spinner } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { createCollegeSearch, type CollegeSearchResult } from "../lib/college-search";
import { OTHER_COLLEGE } from "../schema";
import type { College } from "../types";

export type CollegeChoice = College | typeof OTHER_COLLEGE;

const VISIBLE_MATCHES = 50;
const OTHER_LABEL = "Other (not listed)";

function statusMessage(colleges: College[] | null, query: string, { total }: CollegeSearchResult): string {
  if (colleges === null) return "Loading the college list…";
  if (!query.trim()) return "Start typing the name of your college or school.";
  if (total === 0) return "No matches. Pick Other to type the name.";
  if (total > VISIBLE_MATCHES) return `Showing ${VISIBLE_MATCHES} of ${total} matches. Keep typing to narrow them down.`;
  return total === 1 ? "1 match" : `${total} matches`;
}

type CollegePickerProps = {
  /** µLearn's list, or null while it loads (typing works meanwhile). */
  colleges: College[] | null;
  choice: CollegeChoice | null;
  /** `query` is what the student had typed, when they pick Other straight from a search. */
  onChoose: (choice: CollegeChoice | null, query: string) => void;
  errors?: readonly string[];
};

/**
 * A searchable list of ~2,000 colleges, following the WAI-ARIA combobox
 * pattern: focus stays in the text box while the arrow keys move the
 * highlighted option. The choice is submitted as `college_id`.
 */
export function CollegePicker({ colleges, choice, onChoose, errors }: CollegePickerProps) {
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  // null: highlight the best match, so Enter picks it.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const search = useMemo(() => createCollegeSearch(colleges ?? []), [colleges]);
  const result = useMemo(() => search(query, VISIBLE_MATCHES), [search, query]);
  const options: CollegeChoice[] = [...result.matches, OTHER_COLLEGE];
  const active = activeIndex ?? (result.matches.length > 0 ? 0 : -1);
  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const activeId = open && active >= 0 ? optionId(active) : undefined;

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: "nearest" });
  }, [activeId]);

  function choose(option: CollegeChoice) {
    setQuery(option === OTHER_COLLEGE ? OTHER_LABEL : option.title);
    setOpen(false);
    setActiveIndex(null);
    onChoose(option, choice ? "" : query);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.currentTarget.value);
    setOpen(true);
    setActiveIndex(null);
    if (choice) onChoose(null, "");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (open) setActiveIndex(Math.min(active + 1, options.length - 1));
        else setOpen(true);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (open) setActiveIndex(Math.max(active - 1, 0));
        break;
      case "Enter":
        // Never submit the form from an open list.
        if (!open) break;
        event.preventDefault();
        if (active >= 0) choose(options[active]!);
        else setOpen(false);
        break;
      case "Escape":
        // PledgeDialog leaves this Escape to us instead of closing.
        setOpen(false);
        break;
    }
  }

  return (
    <>
      <FormField name="college_id" label="College or school" errors={errors} required>
        {({ name: _name, ...control }) => (
          <div className="relative">
            <Input
              {...control}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={open ? listboxId : undefined}
              aria-activedescendant={activeId}
              aria-busy={colleges === null ? true : undefined}
              autoComplete="off"
              spellCheck={false}
              placeholder="Start typing its name"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onClick={() => setOpen(true)}
              onFocus={(event) => {
                // Typing replaces a chosen title instead of appending to it.
                if (choice) event.currentTarget.select();
              }}
              onBlur={() => setOpen(false)}
            />
            {open ? (
              <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-input bg-card text-card-foreground shadow-raised">
                <p role="status" className="flex items-center gap-2 px-4 pt-3 pb-2 text-xs text-muted-foreground">
                  {colleges === null ? <Spinner className="size-3" /> : null}
                  {statusMessage(colleges, query, result)}
                </p>
                <ul id={listboxId} role="listbox" aria-label="Colleges and schools" className="max-h-64 overflow-y-auto pb-1">
                  {options.map((option, index) => (
                    <li
                      key={option === OTHER_COLLEGE ? OTHER_COLLEGE : option.id}
                      id={optionId(index)}
                      role="option"
                      aria-selected={index === active}
                      // Keep focus in the text box.
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(option)}
                      className={cn(
                        "cursor-pointer px-4 py-2.5 text-sm hover:bg-foreground/5 aria-selected:bg-foreground/10",
                        option === OTHER_COLLEGE && "border-t border-border font-medium",
                      )}
                    >
                      {option === OTHER_COLLEGE ? OTHER_LABEL : option.title}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </FormField>
      <input type="hidden" name="college_id" value={choice === OTHER_COLLEGE ? OTHER_COLLEGE : (choice?.id ?? "")} />
    </>
  );
}
