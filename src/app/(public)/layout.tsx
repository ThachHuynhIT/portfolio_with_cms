import { SiteFooter } from "@components/public/site-footer";
import { SiteNav } from "@components/public/site-nav";
import { getSiteSettings } from "@/lib/queries";
import styles from "./layout.module.scss";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <SiteNav siteName={settings?.siteName || "Portfolio"} />
      {children}
      <SiteFooter />
    </>
  );
}
