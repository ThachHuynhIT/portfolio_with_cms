"use client";

import { useActionState } from "react";
import { Button } from "@components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { loginAction } from "./actions";
import styles from "./page.module.scss";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className={styles.form} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            aria-invalid={!!state?.error}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!state?.error}
            required
          />
        </Field>
      </FieldGroup>

      {state?.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className={styles.submit}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
