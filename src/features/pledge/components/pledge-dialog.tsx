"use client";

import { Check, CircleCheck } from "lucide-react";
import { startTransition, useActionState, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
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
import { Grain } from "@/components/ui/grain";
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
      <DialogContent className="theme-inverse gap-0 p-0 sm:max-w-5xl sm:p-0 md:overflow-hidden">
        {/* Remounted on every open, so each visit starts with a fresh form. */}
        <PledgeFlow onFindCertificate={onFindCertificate} />
      </DialogContent>
    </Dialog>
  );
}

const STEPS = ["Take the pledge", "Get your certificate", "Share it"] as const;
type Step = 0 | 1 | 2;

export function PledgeFlow({ onFindCertificate }: { onFindCertificate: () => void }) {
  const [state, submit, isPending] = useActionState(submitPledge, IDLE);
  const [viewingCertificate, setViewingCertificate] = useState(false);

  let step: Step = 0;
  let panel: ReactNode;

  if (state.status === "created" || state.status === "already_pledged") {
    const certificate = { name: state.name, certificateId: state.certificateId };
    step = viewingCertificate ? 2 : 1;
    panel = viewingCertificate ? (
      <>
        <PanelHeader title="Your pledge certificate" description="Download it or share it to inspire others." />
        <div className="mt-8">
          <CertificateView certificate={certificate} />
        </div>
      </>
    ) : (
      <PledgeSuccess
        created={state.status === "created"}
        certificate={certificate}
        onViewCertificate={() => setViewingCertificate(true)}
      />
    );
  } else {
    panel = <PledgeForm state={state} submit={submit} isPending={isPending} onFindCertificate={onFindCertificate} />;
  }

  return (
    <div className="grid md:h-[min(50rem,calc(100svh-2rem))] md:grid-cols-2">
      <PledgeAside step={step} />
      <div className="flex flex-col px-6 py-8 sm:px-10 md:overflow-y-auto">{panel}</div>
    </div>
  );
}

/** The visual half: aurora, headline and the three step cards. */
function PledgeAside({ step }: { step: Step }) {
  return (
    <div className="relative isolate m-2 flex flex-col justify-end gap-6 overflow-hidden rounded-card bg-aurora p-5 text-foreground sm:p-8 md:mr-0 md:gap-10">
      <Grain />
      <div className="grid gap-4 pr-10 md:pr-0">
        <p className="max-w-md text-headline font-medium tracking-display">A drug-free Kerala starts with you.</p>
        <p className="hidden max-w-xs text-sm text-foreground/75 md:block">
          Three quick steps. Your name goes on a certificate you can download and share.
        </p>
      </div>
      <ol aria-label="Pledge steps" className="grid grid-cols-3 gap-2 sm:gap-3">
        {STEPS.map((label, index) => (
          <li
            key={label}
            aria-current={index === step ? "step" : undefined}
            data-state={index < step ? "done" : index === step ? "current" : "upcoming"}
            className="group flex min-h-24 flex-col justify-between gap-4 rounded-tile bg-foreground/10 p-3 text-xs font-medium text-foreground/75 backdrop-blur-sm transition-colors duration-500 ease-out-expo data-[state=current]:bg-foreground data-[state=current]:text-background sm:min-h-32 sm:p-4 sm:text-sm"
          >
            <span className="grid size-6 place-items-center rounded-full bg-foreground/15 text-xs tabular-nums group-data-[state=current]:bg-background group-data-[state=current]:text-foreground">
              {index < step ? <Check aria-label="Done" className="size-3.5" /> : index + 1}
            </span>
            <span>{label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PanelHeader({ title, description }: { title: string; description: string }) {
  return (
    <DialogHeader className="items-center px-6 text-center">
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription className="max-w-sm">{description}</DialogDescription>
    </DialogHeader>
  );
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
      <PanelHeader
        title="Join the Movement"
        description="Take the pledge for a drug-free Kerala and receive your personalised certificate."
      />

      <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={isPending} className="mt-7 grid gap-5">
        <FormField
          name="name"
          label="Your name"
          description="Printed on your certificate exactly as you type it."
          errors={errors?.name}
          required
        >
          {(control) => <Input {...control} autoComplete="name" maxLength={80} placeholder="e.g. Anjali Nair" />}
        </FormField>

        <FormField name="email" label="Email" errors={errors?.email} required>
          {(control) => (
            <Input
              {...control}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              placeholder="you@example.com"
            />
          )}
        </FormField>

        <fieldset className="grid gap-3" aria-describedby={statementsError ? statementsErrorId : undefined}>
          <legend className="mb-3 text-sm font-medium">
            By pledging to this drug-free campaign, I accept the following:
          </legend>
          {PLEDGE_STATEMENT_IDS.map((id) => (
            <label key={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground/85">
              <Checkbox name="statements" value={id} aria-invalid={statementsError ? true : undefined} />
              <span>{PLEDGE_STATEMENTS[id]}</span>
            </label>
          ))}
          {statementsError ? <FieldError id={statementsErrorId}>{statementsError}</FieldError> : null}
        </fieldset>

        {state.status === "email_taken" ? (
          <FormAlert>
            This email has already been used to take the pledge. If it&apos;s yours,{" "}
            <button type="button" onClick={onFindCertificate} className="font-semibold underline underline-offset-4">
              find your certificate
            </button>{" "}
            using the name you pledged with.
          </FormAlert>
        ) : (
          <CommonStatusAlert state={state} />
        )}

        <Button type="submit" size="lg" disabled={isPending} className="mt-1 w-full">
          {isPending ? (
            <>
              <Spinner /> Submitting…
            </>
          ) : (
            "Take the Pledge"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already pledged?{" "}
        <button
          type="button"
          onClick={onFindCertificate}
          className="rounded-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Find your certificate
        </button>
      </p>
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
    <div className="flex flex-1 flex-col justify-center gap-6">
      <DialogHeader className="items-center gap-3 pr-0 text-center">
        <IconBadge tone="accent" size="lg">
          <CircleCheck />
        </IconBadge>
        <DialogTitle>{created ? "Pledge successful!" : "You've already pledged"}</DialogTitle>
        <DialogDescription className="max-w-sm">
          {created
            ? "Thank you for joining the movement towards a drug-free Kerala."
            : "Welcome back. Here is the certificate for your pledge."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-1 rounded-tile bg-muted px-4 py-4 text-center">
        <span className="text-xs text-muted-foreground">Your certificate ID</span>
        <span className="font-poster text-4xl leading-none tracking-wide text-highlight tabular-nums">
          {certificate.certificateId}
        </span>
      </div>

      <DialogFooter className="sm:justify-center">
        <DialogClose asChild>
          <Button variant="outline" size="lg">
            Close
          </Button>
        </DialogClose>
        {/* Focus lands here when the form is replaced by this view. */}
        <Button size="lg" arrow onClick={onViewCertificate} autoFocus>
          View certificate
        </Button>
      </DialogFooter>
    </div>
  );
}
