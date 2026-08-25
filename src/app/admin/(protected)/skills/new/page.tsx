import { AdminPageHeader } from "@components/admin/admin-page-header";
import { SkillForm } from "../skill-form";
import type { SkillFormInput } from "@lib/admin/skill-schema";

const emptyDefaults: SkillFormInput = {
  name: "",
  category: "",
  iconUrl: "",
  order: 0,
};

export const metadata = { title: "New skill" };

export default function NewSkillPage() {
  return (
    <>
      <AdminPageHeader
        title="New skill"
        breadcrumbs={[
          { label: "Skills", href: "/admin/skills" },
          { label: "New skill" },
        ]}
      />
      <SkillForm defaultValues={emptyDefaults} submitLabel="Create skill" />
    </>
  );
}
