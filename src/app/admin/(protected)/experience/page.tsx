import Link from "next/link";
import { getExperienceEntries } from "@/lib/queries";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { Button } from "@components/ui/button";
import { ExperienceTable } from "./experience-table";

export const metadata = { title: "Experience" };

export default async function AdminExperiencePage() {
  const entries = await getExperienceEntries();

  return (
    <>
      <AdminPageHeader title="Experience">
        <Button nativeButton={false} render={<Link href="/admin/experience/new" />}>
          New entry
        </Button>
      </AdminPageHeader>
      <ExperienceTable entries={entries} />
    </>
  );
}
