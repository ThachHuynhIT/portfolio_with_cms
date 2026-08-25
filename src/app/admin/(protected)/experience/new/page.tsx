import { AdminPageHeader } from "@components/admin/admin-page-header";
import { ExperienceForm } from "../experience-form";
import type { ExperienceFormInput } from "@lib/admin/experience-schema";

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
    <>
      <AdminPageHeader
        title="New experience entry"
        breadcrumbs={[
          { label: "Experience", href: "/admin/experience" },
          { label: "New experience entry" },
        ]}
      />
      <ExperienceForm defaultValues={emptyDefaults} submitLabel="Create entry" />
    </>
  );
}
