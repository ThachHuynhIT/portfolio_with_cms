import styles from "./dashboard-skeleton.module.scss";

export function DashboardSkeleton() {
  return (
    <div className={styles.stack}>
      <div className={styles.statGrid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.statCard} />
        ))}
      </div>
      <div className={styles.section} />
      <div className={styles.actionsRow} />
    </div>
  );
}
