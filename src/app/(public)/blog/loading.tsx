import styles from "./loading.module.scss";

export default function BlogLoading() {
  return (
    <main id="main-content" className={styles.main} aria-busy="true">
      <span className={styles.srOnly}>Loading posts…</span>
      <div className={styles.titleSkeleton} />
      <div className={styles.list}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.cardSkeleton}>
            <div className={styles.coverSkeleton} />
            <div className={styles.cardBodySkeleton}>
              <div className={styles.dateSkeleton} />
              <div className={styles.lineSkeleton} />
              <div className={styles.lineSkeletonShort} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
