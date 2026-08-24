import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@components/ui/button";
import styles from "./admin-empty-state.module.scss";

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className={styles.empty}>
      <Icon aria-hidden="true" className={styles.icon} />
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {actionHref && actionLabel && (
        <Button size="sm" render={<Link href={actionHref} />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
