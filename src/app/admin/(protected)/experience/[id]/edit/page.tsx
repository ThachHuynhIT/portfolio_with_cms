import { notFound } from "next/navigation";
import { getExperienceEntryByIdAdmin } from "@lib/admin/experience-entries";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { ExperienceForm } from "../../experience-form";
import type { ExperienceFormInput } from "@lib/admin/experience-schema";

export const metadata = { title: "Edit experience entry" };

// `<input type="date">` needs "YYYY-MM-DD" — Date#toISOString() always
// includes the time/zone suffix, so slice it off rather than reformatting.
function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function EditExperienceEntryPage(
  props: PageProps<"/admin/experience/[id]/edit">
) {
  const { id } = await props.params;
  const entry = await getExperienceEntryByIdAdmin(id);

  if (!entry) {
    notFound();
  }

  const defaultValues: ExperienceFormInput = {
    type: entry.type,
    title: entry.title,
    organization: entry.organization,
    location: entry.location ?? "",
    startDate: toDateInputValue(entry.startDate),
    endDate: entry.endDate ? toDateInputValue(entry.endDate) : "",
    description: entry.description,
    order: entry.order,
  };

  return (
    <>
      <AdminPageHeader
        title="Edit experience entry"
        breadcrumbs={[
          { label: "Experience", href: "/admin/experience" },
          { label: "Edit experience entry" },
        ]}
      />
      <ExperienceForm
        defaultValues={defaultValues}
        entryId={entry.id}
        submitLabel="Save changes"
      />
    </>
  );
}
