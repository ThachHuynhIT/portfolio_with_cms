import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@components/admin/admin-sidebar";
import { AdminUserMenu } from "@components/admin/admin-user-menu";
import { ThemeToggle } from "@components/theme-toggle";
import { Toaster } from "@components/ui/sonner";
import { logoutAction } from "./actions";
import styles from "./layout.module.scss";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/admin" className={styles.brand}>
          Admin
        </Link>
        <div className={styles.topbarRight}>
          <ThemeToggle />
          <AdminUserMenu
            email={session.user?.email ?? ""}
            logoutAction={logoutAction}
          />
        </div>
      </header>
      <div className={styles.body}>
        <AdminSidebar />
        <main className={styles.content}>{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
