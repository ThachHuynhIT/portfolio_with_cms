import { SkillForm } from "../skill-form";
import type { SkillFormInput } from "@lib/admin/skill-schema";
import styles from "./page.module.scss";

const emptyDefaults: SkillFormInput = {
  name: "",
  category: "",
  iconUrl: "",
  order: 0,
};

export const metadata = { title: "New skill" };

export default function NewSkillPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>New skill</h1>
      <SkillForm defaultValues={emptyDefaults} submitLabel="Create skill" />
    </main>
  );
}
