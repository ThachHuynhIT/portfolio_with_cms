import styles from "./loading.module.scss";

// Group-level fallback — shown for public routes that don't (yet) have
// their own more specific loading.tsx. Not meant to match any one page's
// exact shape (projects/blog get their own shaped skeletons in PR 8/9);
// this is just enough feedback that navigation is happening.
export default function PublicLoading() {
  return (
    <main id="main-content" className={styles.main} aria-busy="true">
      <span className={styles.srOnly}>Loading…</span>
      <div className={`${styles.skeletonBlock} ${styles.title}`} />
      <div className={`${styles.skeletonBlock} ${styles.line}`} />
      <div className={`${styles.skeletonBlock} ${styles.line}`} />
      <div className={`${styles.skeletonBlock} ${styles.lineShort}`} />
    </main>
  );
}
