import styles from "./admin-form-skeleton.module.scss";

// Mimics AdminFormShell's field-by-field shape so it doesn't cause its own
// CLS once the real form swaps in.
export function AdminFormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className={styles.stack}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className={styles.field}>
          <div className={styles.label} />
          <div className={styles.input} />
        </div>
      ))}
      <div className={styles.actions} />
    </div>
  );
}
