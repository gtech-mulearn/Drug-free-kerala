"use client";

import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { DoveMark } from "@/components/brand/dove-mark";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormAlert, FormField, Input, Spinner } from "@/components/ui/form";
import { CertificateView } from "@/features/certificate/components/certificate-view";
import { lookupCertificate } from "../actions";
import { LookupFormSchema } from "../schema";
import { IDLE, type LookupState } from "../types";
import { CommonStatusAlert, useFocusFirstInvalid } from "./form-parts";

type LookupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTakePledge: () => void;
};

/**
 * The secondary dialog: the pledge dialog's dark inputs and type, but a
 * compact single column without the visual panel.
 */
export function LookupDialog({ open, onOpenChange, onTakePledge }: LookupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="theme-inverse gap-0 px-6 pt-7 pb-6 sm:max-w-md sm:px-8 sm:pt-8 sm:has-[canvas]:max-w-2xl">
        <LookupFlow onTakePledge={onTakePledge} />
      </DialogContent>
    </Dialog>
  );
}

function LookupHeader({ title, description }: { title: string; description: string }) {
  return (
    <DialogHeader className="gap-3">
      <DoveMark className="h-9 w-auto self-start" />
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  );
}

export function LookupFlow({ onTakePledge }: { onTakePledge: () => void }) {
  const [state, submit, isPending] = useActionState(lookupCertificate, IDLE);

  if (state.status === "found") {
    return (
      <>
        <LookupHeader title="Your pledge certificate" description="Welcome back. Download it again or share it." />
        <div className="mt-6">
          <CertificateView certificate={{ name: state.name, certificateId: state.certificateId }} />
        </div>
      </>
    );
  }

  return <LookupForm state={state} submit={submit} isPending={isPending} onTakePledge={onTakePledge} />;
}

type FieldErrors = Partial<Record<"name" | "email", string[]>>;

function LookupForm({
  state,
  submit,
  isPending,
  onTakePledge,
}: {
  state: LookupState;
  submit: (data: FormData) => void;
  isPending: boolean;
  onTakePledge: () => void;
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
      <LookupHeader
        title="Find your certificate"
        description="Enter the name and email you pledged with. We only show a certificate when both match."
      />

      <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={isPending} className="mt-7 grid gap-5">
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

        <Button type="submit" variant="secondary" size="lg" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Spinner /> Searching…
            </>
          ) : (
            "Find certificate"
          )}
        </Button>
      </form>

      <p className="mt-6 border-t pt-5 text-sm text-muted-foreground">
        Haven&apos;t pledged yet?{" "}
        <button
          type="button"
          onClick={onTakePledge}
          className="rounded-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Take the pledge
        </button>
      </p>
    </>
  );
}
