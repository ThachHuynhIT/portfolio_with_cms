import Link from "next/link";
import { getExperienceEntries } from "@/lib/queries";
import { Button } from "@components/ui/button";
import { ExperienceTable } from "./experience-table";
import styles from "./page.module.scss";

export const metadata = { title: "Experience" };

export default async function AdminExperiencePage() {
  const entries = await getExperienceEntries();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Experience</h1>
        <Button render={<Link href="/admin/experience/new" />}>
          New entry
        </Button>
      </div>
      <ExperienceTable entries={entries} />
    </main>
  );
}
