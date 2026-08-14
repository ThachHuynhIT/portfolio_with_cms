import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Toaster } from "@components/ui/sonner";
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
    <>
      <nav className={styles.nav}>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/projects">Projects</Link>
        <Link href="/admin/blog-posts">Blog posts</Link>
        <Link href="/admin/skills">Skills</Link>
      </nav>
      {children}
      <Toaster theme="dark" />
    </>
  );
}
