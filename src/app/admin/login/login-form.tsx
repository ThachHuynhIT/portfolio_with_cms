"use client";

import { useActionState } from "react";
import { Button } from "@components/ui/button";
import { loginAction } from "./actions";
import styles from "./page.module.scss";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
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
