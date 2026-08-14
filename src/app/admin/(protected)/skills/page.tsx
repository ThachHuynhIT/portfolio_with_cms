import Link from "next/link";
import { getSkills } from "@/lib/queries";
import { Button } from "@components/ui/button";
import { SkillsTable } from "./skills-table";
import styles from "./page.module.scss";

export const metadata = { title: "Skills" };

export default async function AdminSkillsPage() {
  const skills = await getSkills();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Skills</h1>
        <Button render={<Link href="/admin/skills/new" />}>New skill</Button>
      </div>
      <SkillsTable skills={skills} />
    </main>
  );
}
