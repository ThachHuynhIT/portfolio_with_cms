import { notFound } from "next/navigation";
import { getSkillByIdAdmin } from "@lib/admin/skills";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { SkillForm } from "../../skill-form";
import type { SkillFormInput } from "@lib/admin/skill-schema";

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
    <>
      <AdminPageHeader
        title="Edit skill"
        breadcrumbs={[
          { label: "Skills", href: "/admin/skills" },
          { label: "Edit skill" },
        ]}
      />
      <SkillForm
        defaultValues={defaultValues}
        skillId={skill.id}
        submitLabel="Save changes"
      />
    </>
  );
}
