import styles from "./status-badge.module.scss";

export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  return (
    <span className={status === "PUBLISHED" ? styles.published : styles.draft}>
      {status === "PUBLISHED" ? "Published" : "Draft"}
    </span>
  );
}
