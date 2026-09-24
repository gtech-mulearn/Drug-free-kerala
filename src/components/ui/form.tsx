import { LoaderCircle } from "lucide-react";
import { useId } from "react";
import type * as React from "react";
import { cn } from "@/lib/utils";

/* ── Label ─────────────────────────────────────────────────────────────── */

export function Label({ className, htmlFor, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      htmlFor={htmlFor}
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

/* ── Input ─────────────────────────────────────────────────────────────── */

export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-md border border-input bg-card px-4 text-base text-card-foreground shadow-xs md:text-sm",
        "transition-[border-color,box-shadow] duration-200 ease-standard placeholder:text-muted-foreground",
        "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/* ── Checkbox (native, so it works with FormData and assistive tech) ───── */

export function Checkbox({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "mt-0.5 size-5 shrink-0 cursor-pointer rounded-sm accent-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/* ── FormField: wires label, description and error to one control ─────── */

export type FieldControlProps = {
  id: string;
  name: string;
  required?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

export type FormFieldProps = {
  name: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Validation messages for this field; the first one is shown. */
  errors?: readonly string[];
  required?: boolean;
  className?: string;
  children: (control: FieldControlProps) => React.ReactNode;
};

export function FormField({ name, label, description, errors, required, className, children }: FormFieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const error = errors?.[0];
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div data-slot="form-field" className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        name,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {description ? (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

export function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="field-error" className={cn("text-sm font-medium text-destructive", className)} {...props} />;
}

/* ── Alert: form-level status messages ─────────────────────────────────── */

export function FormAlert({
  tone = "destructive",
  className,
  ...props
}: React.ComponentProps<"div"> & { tone?: "destructive" | "info" }) {
  return (
    <div
      role={tone === "destructive" ? "alert" : "status"}
      data-slot="form-alert"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        tone === "destructive"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-primary/30 bg-accent text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

/* ── Spinner ───────────────────────────────────────────────────────────── */

export function Spinner({ className, ...props }: React.ComponentProps<typeof LoaderCircle>) {
  return <LoaderCircle aria-hidden="true" className={cn("size-4 animate-spin", className)} {...props} />;
}
