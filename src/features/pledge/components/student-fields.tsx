"use client";

import { useState, type ChangeEvent } from "react";
import { z } from "zod";
import { Checkbox, FormField, Input } from "@/components/ui/form";
import { OTHER_COLLEGE } from "../schema";
import type { College, PledgeField } from "../types";
import { CollegePicker, type CollegeChoice } from "./college-picker";

const CollegeList = z.object({ colleges: z.array(z.object({ id: z.string(), title: z.string() })) });

/** Same-origin (connect-src 'self'): the server proxies µLearn's list. */
async function loadColleges(): Promise<College[]> {
  const response = await fetch("/api/colleges");
  if (!response.ok) throw new Error(`/api/colleges responded ${response.status}`);
  return CollegeList.parse(await response.json()).colleges;
}

type ListState = { status: "idle" | "loading" | "failed" } | { status: "ready"; colleges: College[] };

/**
 * "Are you a student?" and, when ticked, the college picker. The list is
 * fetched on the first tick; if it can't be loaded, students type the name
 * instead, so nobody is kept from pledging.
 */
export function StudentFields({ errors }: { errors: Partial<Record<PledgeField, string[]>> | null }) {
  const [isStudent, setIsStudent] = useState(false);
  const [list, setList] = useState<ListState>({ status: "idle" });
  const [choice, setChoice] = useState<CollegeChoice | null>(null);
  const [otherDraft, setOtherDraft] = useState("");

  function handleStudentChange(event: ChangeEvent<HTMLInputElement>) {
    const checked = event.currentTarget.checked;
    setIsStudent(checked);
    if (!checked) setChoice(null);
    if (checked && list.status === "idle") {
      setList({ status: "loading" });
      loadColleges().then(
        (colleges) => setList({ status: "ready", colleges }),
        () => setList({ status: "failed" }),
      );
    }
  }

  function handleChoose(next: CollegeChoice | null, query: string) {
    setChoice(next);
    if (next === OTHER_COLLEGE) setOtherDraft(query.trim());
  }

  return (
    <>
      <label className="flex cursor-pointer items-start gap-3 text-sm font-medium">
        <Checkbox name="is_student" checked={isStudent} onChange={handleStudentChange} />
        <span>Are you a student?</span>
      </label>

      {!isStudent ? null : list.status === "failed" ? (
        <>
          <input type="hidden" name="college_id" value={OTHER_COLLEGE} />
          <FormField
            name="college_other"
            label="College or school"
            description="We couldn't load the list of colleges, so please type the name."
            errors={errors?.college_other}
            required
          >
            {(control) => <Input {...control} maxLength={255} />}
          </FormField>
        </>
      ) : (
        <>
          <CollegePicker
            colleges={list.status === "ready" ? list.colleges : null}
            choice={choice}
            onChoose={handleChoose}
            errors={errors?.college_id}
          />
          {choice === OTHER_COLLEGE ? (
            <FormField
              name="college_other"
              label="Name of your college or school"
              errors={errors?.college_other}
              required
            >
              {/* Mounted by picking Other, so focus moves straight here. */}
              {(control) => <Input {...control} defaultValue={otherDraft} maxLength={255} autoFocus />}
            </FormField>
          ) : null}
        </>
      )}
    </>
  );
}
