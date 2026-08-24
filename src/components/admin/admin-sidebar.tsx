"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV, isNavLinkActive } from "./admin-nav-links";
import styles from "./admin-sidebar.module.scss";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className={styles.sidebar} aria-label="Admin sections">
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const isActive = isNavLinkActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={isActive ? styles.linkActive : styles.link}
          >
            <Icon aria-hidden="true" className={styles.icon} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
