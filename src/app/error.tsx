"use client";

import styles from "./error.module.scss";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.description}>
        An unexpected error occurred. You can try again, or come back later.
      </p>
      <button type="button" className={styles.action} onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}
