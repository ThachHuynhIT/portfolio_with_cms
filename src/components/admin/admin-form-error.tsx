"use client";

import { useEffect, useRef } from "react";
import styles from "./admin-form-error.module.scss";

export function AdminFormError({ message }: { message: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message) ref.current?.focus();
  }, [message]);

  if (!message) return null;

  return (
    <div ref={ref} role="alert" tabIndex={-1} className={styles.error}>
      {message}
    </div>
  );
}
