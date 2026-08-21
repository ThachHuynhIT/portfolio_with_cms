import styles from "./loading.module.scss";

export default function ProjectsLoading() {
  return (
    <main id="main-content" className={styles.main} aria-busy="true">
      <span className={styles.srOnly}>Loading projects…</span>
      <div className={styles.titleSkeleton} />
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.cardSkeleton}>
            <div className={styles.coverSkeleton} />
            <div className={styles.lineSkeleton} />
            <div className={styles.lineSkeletonShort} />
          </div>
        ))}
      </div>
    </main>
  );
}
