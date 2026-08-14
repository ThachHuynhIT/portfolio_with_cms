import Link from "next/link";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.description}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Link href="/" className={styles.action}>
        Back to home
      </Link>
    </main>
  );
}
