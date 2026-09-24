"use client";

import { useEffect, type RefObject } from "react";
import { FormAlert } from "@/components/ui/form";
import type { LookupState, PledgeState } from "../types";

function formatWait(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? "a minute" : `${minutes} minutes`;
}

/** Messages for outcomes shared by both forms. */
export function CommonStatusAlert({ state }: { state: PledgeState | LookupState }) {
  switch (state.status) {
    case "rate_limited":
      return (
        <FormAlert>
          Too many attempts from your network. Please try again in {formatWait(state.retryAfterSeconds)}.
        </FormAlert>
      );
    case "error":
      return <FormAlert>Something went wrong on our side. Please try again in a moment.</FormAlert>;
    default:
      return null;
  }
}

/** Moves focus to the first invalid control whenever a new set of errors arrives. */
export function useFocusFirstInvalid(formRef: RefObject<HTMLFormElement | null>, errors: object | null) {
  useEffect(() => {
    if (!errors || Object.keys(errors).length === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [formRef, errors]);
}
