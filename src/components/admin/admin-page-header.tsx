import { AdminBreadcrumbs, type AdminBreadcrumbItem } from "./admin-breadcrumbs";
import styles from "./admin-page-header.module.scss";

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  children,
}: {
  title: string;
  description?: string;
  breadcrumbs?: AdminBreadcrumbItem[];
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.header}>
      {breadcrumbs && <AdminBreadcrumbs items={breadcrumbs} />}
      <div className={styles.titleRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
        {children && <div className={styles.actions}>{children}</div>}
      </div>
    </div>
  );
}
