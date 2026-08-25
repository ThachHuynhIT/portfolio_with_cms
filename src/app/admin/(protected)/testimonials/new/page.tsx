import { AdminPageHeader } from "@components/admin/admin-page-header";
import { TestimonialForm } from "../testimonial-form";
import type { TestimonialFormInput } from "@lib/admin/testimonial-schema";

const emptyDefaults: TestimonialFormInput = {
  authorName: "",
  authorRole: "",
  authorAvatarUrl: "",
  quote: "",
  order: 0,
  status: "DRAFT",
};

export const metadata = { title: "New testimonial" };

export default function NewTestimonialPage() {
  return (
    <>
      <AdminPageHeader
        title="New testimonial"
        breadcrumbs={[
          { label: "Testimonials", href: "/admin/testimonials" },
          { label: "New testimonial" },
        ]}
      />
      <TestimonialForm
        defaultValues={emptyDefaults}
        submitLabel="Create testimonial"
      />
    </>
  );
}
