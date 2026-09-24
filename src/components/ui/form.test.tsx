import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField, Input } from "./form";

describe("FormField", () => {
  it("labels the control and links its description", () => {
    render(
      <FormField name="name" label="Your name" description="As printed on the certificate." required>
        {(control) => <Input {...control} />}
      </FormField>,
    );
    const input = screen.getByLabelText("Your name");
    expect(input).toHaveAttribute("name", "name");
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription("As printed on the certificate.");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("marks the control invalid and announces the first error", () => {
    render(
      <FormField name="email" label="Email" description="We never share it." errors={["Enter a valid email address."]}>
        {(control) => <Input {...control} />}
      </FormField>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("We never share it. Enter a valid email address.");
  });
});
