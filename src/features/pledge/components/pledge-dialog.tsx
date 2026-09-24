"use client";

import { CircleCheck } from "lucide-react";
import { startTransition, useActionState, useId, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox, FieldError, FormAlert, FormField, Input, Spinner } from "@/components/ui/form";
import { IconBadge } from "@/components/ui/icon-badge";
import { CertificateView } from "@/features/certificate/components/certificate-view";
import type { Certificate } from "@/features/certificate/types";
import { submitPledge } from "../actions";
import { PLEDGE_STATEMENT_IDS, PLEDGE_STATEMENTS } from "../content";
import { PledgeFormSchema } from "../schema";
import { IDLE, type PledgeState } from "../types";
import { CommonStatusAlert, useFocusFirstInvalid } from "./form-parts";

type PledgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFindCertificate: () => void;
};

export function PledgeDialog({ open, onOpenChange, onFindCertificate }: PledgeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {/* Remounted on every open, so each visit starts with a fresh form. */}
        <PledgeFlow onFindCertificate={onFindCertificate} />
      </DialogContent>
    </Dialog>
  );
}

export function PledgeFlow({ onFindCertificate }: { onFindCertificate: () => void }) {
  const [state, submit, isPending] = useActionState(submitPledge, IDLE);
  const [viewingCertificate, setViewingCertificate] = useState(false);

  if (state.status === "created" || state.status === "already_pledged") {
    const certificate = { name: state.name, certificateId: state.certificateId };
    return viewingCertificate ? (
      <>
        <DialogHeader>
          <DialogTitle>Your pledge certificate</DialogTitle>
          <DialogDescription>Download it or share it to inspire others.</DialogDescription>
        </DialogHeader>
        <CertificateView certificate={certificate} />
      </>
    ) : (
      <PledgeSuccess
        created={state.status === "created"}
        certificate={certificate}
        onViewCertificate={() => setViewingCertificate(true)}
      />
    );
  }

  return <PledgeForm state={state} submit={submit} isPending={isPending} onFindCertificate={onFindCertificate} />;
}

type FieldErrors = Partial<Record<"name" | "email" | "statements", string[]>>;

function PledgeForm({
  state,
  submit,
  isPending,
  onFindCertificate,
}: {
  state: PledgeState;
  submit: (data: FormData) => void;
  isPending: boolean;
  onFindCertificate: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const statementsErrorId = useId();
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const errors: FieldErrors | null = clientErrors ?? (state.status === "invalid" ? state.fieldErrors : null);
  useFocusFirstInvalid(formRef, errors);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    // Same schema as the server: instant feedback, identical messages.
    const check = PledgeFormSchema.safeParse({
      name: data.get("name") ?? "",
      email: data.get("email") ?? "",
      statements: data.getAll("statements"),
    });
    if (!check.success) {
      setClientErrors(z.flattenError(check.error).fieldErrors);
      return;
    }

    setClientErrors(null);
    startTransition(() => submit(data));
  }

  const statementsError = errors?.statements?.[0];

  return (
    <>
      <DialogHeader>
        <DialogTitle>Join the Movement</DialogTitle>
        <DialogDescription>Take the pledge for a drug-free Kerala and receive your personalised certificate.</DialogDescription>
      </DialogHeader>

      <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={isPending} className="grid gap-5">
        <FormField
          name="name"
          label="Your name"
          description="Printed on your certificate exactly as you type it."
          errors={errors?.name}
          required
        >
          {(control) => <Input {...control} autoComplete="name" maxLength={80} />}
        </FormField>

        <FormField name="email" label="Email" errors={errors?.email} required>
          {(control) => <Input {...control} type="email" inputMode="email" autoComplete="email" maxLength={254} />}
        </FormField>

        <fieldset className="grid gap-3" aria-describedby={statementsError ? statementsErrorId : undefined}>
          <legend className="mb-3 text-sm font-medium">
            By pledging to this drug-free campaign, I accept the following:
          </legend>
          {PLEDGE_STATEMENT_IDS.map((id) => (
            <label key={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
              <Checkbox name="statements" value={id} aria-invalid={statementsError ? true : undefined} />
              <span>{PLEDGE_STATEMENTS[id]}</span>
            </label>
          ))}
          {statementsError ? <FieldError id={statementsErrorId}>{statementsError}</FieldError> : null}
        </fieldset>

        {state.status === "email_taken" ? (
          <FormAlert>
            This email has already been used to take the pledge. If it&apos;s yours,{" "}
            <button
              type="button"
              onClick={onFindCertificate}
              className="font-semibold underline underline-offset-4"
            >
              find your certificate
            </button>{" "}
            using the name you pledged with.
          </FormAlert>
        ) : (
          <CommonStatusAlert state={state} />
        )}

        <Button type="submit" size="lg" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Spinner /> Submitting…
            </>
          ) : (
            "Take the Pledge"
          )}
        </Button>
      </form>
    </>
  );
}

function PledgeSuccess({
  created,
  certificate,
  onViewCertificate,
}: {
  created: boolean;
  certificate: Certificate;
  onViewCertificate: () => void;
}) {
  return (
    <>
      <DialogHeader className="items-center pr-0 text-center">
        <IconBadge tone="accent" size="lg">
          <CircleCheck />
        </IconBadge>
        <DialogTitle>{created ? "Pledge successful!" : "You've already pledged"}</DialogTitle>
        <DialogDescription>
          {created
            ? "Thank you for joining the movement towards a drug-free Kerala."
            : "Welcome back. Here is the certificate for your pledge."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-1 rounded-lg bg-muted px-4 py-3 text-center">
        <span className="text-xs text-muted-foreground">Your certificate ID</span>
        <span className="text-lg font-semibold tracking-wide text-primary tabular-nums">{certificate.certificateId}</span>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" size="lg">
            Close
          </Button>
        </DialogClose>
        {/* Focus lands here when the form is replaced by this view. */}
        <Button size="lg" onClick={onViewCertificate} autoFocus>
          View certificate
        </Button>
      </DialogFooter>
    </>
  );
}
