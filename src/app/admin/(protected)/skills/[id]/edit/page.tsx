import { notFound } from "next/navigation";
import { getSkillByIdAdmin } from "@lib/admin/skills";
import { SkillForm } from "../../skill-form";
import type { SkillFormInput } from "@lib/admin/skill-schema";
import styles from "./page.module.scss";

export const metadata = { title: "Edit skill" };

export default async function EditSkillPage(
  props: PageProps<"/admin/skills/[id]/edit">
) {
  const { id } = await props.params;
  const skill = await getSkillByIdAdmin(id);

  if (!skill) {
    notFound();
  }

  const defaultValues: SkillFormInput = {
    name: skill.name,
    category: skill.category,
    iconUrl: skill.iconUrl ?? "",
    order: skill.order,
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Edit skill</h1>
      <SkillForm
        defaultValues={defaultValues}
        skillId={skill.id}
        submitLabel="Save changes"
      />
    </main>
  );
}
