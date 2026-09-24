"use client";

import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormAlert, FormField, Input, Spinner } from "@/components/ui/form";
import { CertificateView } from "@/features/certificate/components/certificate-view";
import { lookupCertificate } from "../actions";
import { LookupFormSchema } from "../schema";
import { IDLE, type LookupState } from "../types";
import { CommonStatusAlert, useFocusFirstInvalid } from "./form-parts";

type LookupDialogProps = { open: boolean; onOpenChange: (open: boolean) => void };

export function LookupDialog({ open, onOpenChange }: LookupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <LookupFlow />
      </DialogContent>
    </Dialog>
  );
}

export function LookupFlow() {
  const [state, submit, isPending] = useActionState(lookupCertificate, IDLE);

  if (state.status === "found") {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Your pledge certificate</DialogTitle>
          <DialogDescription>Welcome back. Download it again or share it.</DialogDescription>
        </DialogHeader>
        <CertificateView certificate={{ name: state.name, certificateId: state.certificateId }} />
      </>
    );
  }

  return <LookupForm state={state} submit={submit} isPending={isPending} />;
}

type FieldErrors = Partial<Record<"name" | "email", string[]>>;

function LookupForm({
  state,
  submit,
  isPending,
}: {
  state: LookupState;
  submit: (data: FormData) => void;
  isPending: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const errors: FieldErrors | null = clientErrors ?? (state.status === "invalid" ? state.fieldErrors : null);
  useFocusFirstInvalid(formRef, errors);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const check = LookupFormSchema.safeParse({ name: data.get("name") ?? "", email: data.get("email") ?? "" });
    if (!check.success) {
      setClientErrors(z.flattenError(check.error).fieldErrors);
      return;
    }
    setClientErrors(null);
    startTransition(() => submit(data));
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Find your certificate</DialogTitle>
        <DialogDescription>
          Enter the name and email you pledged with. We only show a certificate when both match.
        </DialogDescription>
      </DialogHeader>

      <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={isPending} className="grid gap-5">
        <FormField name="name" label="Name you pledged with" errors={errors?.name} required>
          {(control) => <Input {...control} autoComplete="name" maxLength={80} />}
        </FormField>
        <FormField name="email" label="Email" errors={errors?.email} required>
          {(control) => <Input {...control} type="email" inputMode="email" autoComplete="email" maxLength={254} />}
        </FormField>

        {state.status === "not_found" ? (
          <FormAlert>
            We couldn&apos;t find a pledge with that name and email. Check the spelling and use the exact name you
            pledged with.
          </FormAlert>
        ) : (
          <CommonStatusAlert state={state} />
        )}

        <Button type="submit" size="lg" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Spinner /> Searching…
            </>
          ) : (
            "Find certificate"
          )}
        </Button>
      </form>
    </>
  );
}
