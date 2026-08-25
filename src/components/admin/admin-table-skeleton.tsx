import styles from "./admin-table-skeleton.module.scss";

// Mimics AdminDataTable's bordered shape so it doesn't cause its own CLS
// once real rows swap in. Sits directly inside .content (already
// section-stacked), same convention as the public ArticleSkeleton.
export function AdminTableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className={styles.headerCell} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className={styles.cell} />
          ))}
        </div>
      ))}
    </div>
  );
}
