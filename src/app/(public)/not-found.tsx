import Link from "next/link";
import styles from "./not-found.module.scss";

// Colocated within the (public) route group (rather than importing the root
// not-found.tsx) so a bad slug like /projects/xyz renders inside this
// layout's nav/footer/skip-link instead of falling through to the bare root
// not-found, which renders outside any layout.
export default function PublicNotFound() {
  return (
    <main id="main-content" className={styles.main}>
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
