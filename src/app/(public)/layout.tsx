import { SiteNav } from "@components/public/site-nav";
import { getSiteSettings } from "@/lib/queries";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <SiteNav siteName={settings?.siteName || "Portfolio"} />
      {children}
    </>
  );
}
