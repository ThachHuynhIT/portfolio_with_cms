import styles from "./loading.module.scss";

// /cv gets its own skeleton rather than falling back to the group-level
// `(public)/loading.tsx` (which about/contact use) because that fallback's
// container is `page-container` (48rem) — /cv's real layout uses `measure`
// (68ch) instead, and a width mismatch there is exactly the CLS the shared
// fallback is meant to avoid for pages whose shape it doesn't match
// (see blog/loading.tsx's comment for the same reasoning).
export default function CvLoading() {
  return (
    <main id="main-content" className={styles.main} aria-busy="true">
      <span className={styles.srOnly}>Loading CV…</span>
      <div className={styles.header}>
        <div className={`${styles.block} ${styles.name}`} />
        <div className={`${styles.block} ${styles.role}`} />
        <div className={`${styles.block} ${styles.contact}`} />
      </div>
      <div className={styles.entryList}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={styles.entrySkeleton}>
            <div className={`${styles.block} ${styles.rail}`} />
            <div className={styles.entryLines}>
              <div className={`${styles.block} ${styles.line}`} />
              <div className={`${styles.block} ${styles.lineShort}`} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
