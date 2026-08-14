import { ExperienceForm } from "../experience-form";
import type { ExperienceFormInput } from "@lib/admin/experience-schema";
import styles from "./page.module.scss";

const emptyDefaults: ExperienceFormInput = {
  type: "WORK",
  title: "",
  organization: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
  order: 0,
};

export const metadata = { title: "New experience entry" };

export default function NewExperienceEntryPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>New experience entry</h1>
      <ExperienceForm defaultValues={emptyDefaults} submitLabel="Create entry" />
    </main>
  );
}
