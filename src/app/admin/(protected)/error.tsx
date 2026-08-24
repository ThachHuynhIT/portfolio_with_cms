"use client";

import Link from "next/link";
import { Button } from "@components/ui/button";
import styles from "./error.module.scss";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.description}>
        An unexpected error occurred while loading this page.
      </p>
      <div className={styles.actions}>
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button variant="outline" render={<Link href="/admin" />}>
          Back to dashboard
        </Button>
      </div>
    </main>
  );
}
