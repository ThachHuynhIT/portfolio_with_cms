import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import styles from "./admin-stat-card.module.scss";

export function AdminStatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  hint?: string;
  href?: string;
  icon?: LucideIcon;
  tone?: "default" | "warning";
}) {
  const cardClass = `${styles.card} ${tone === "warning" ? styles.warning : ""}`;

  const content = (
    <>
      {Icon && <Icon aria-hidden="true" className={styles.icon} />}
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return <div className={cardClass}>{content}</div>;
}
