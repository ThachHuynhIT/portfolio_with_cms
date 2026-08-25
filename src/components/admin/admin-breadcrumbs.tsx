import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import styles from "./admin-breadcrumbs.module.scss";

export type AdminBreadcrumbItem = {
  label: string;
  href?: string;
};

export function AdminBreadcrumbs({ items }: { items: AdminBreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className={styles.item}>
              {item.href && !isLast ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRightIcon
                  aria-hidden="true"
                  className={styles.separator}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
