import Link from "next/link";
import { getSkills } from "@/lib/queries";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { Button } from "@components/ui/button";
import { SkillsTable } from "./skills-table";

export const metadata = { title: "Skills" };

export default async function AdminSkillsPage() {
  const skills = await getSkills();

  return (
    <>
      <AdminPageHeader title="Skills">
        <Button render={<Link href="/admin/skills/new" />}>New skill</Button>
      </AdminPageHeader>
      <SkillsTable skills={skills} />
    </>
  );
}
