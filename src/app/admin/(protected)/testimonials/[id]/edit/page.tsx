import { notFound } from "next/navigation";
import { getTestimonialByIdAdmin } from "@lib/admin/testimonials";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { TestimonialForm } from "../../testimonial-form";
import type { TestimonialFormInput } from "@lib/admin/testimonial-schema";

export const metadata = { title: "Edit testimonial" };

export default async function EditTestimonialPage(
  props: PageProps<"/admin/testimonials/[id]/edit">
) {
  const { id } = await props.params;
  const testimonial = await getTestimonialByIdAdmin(id);

  if (!testimonial) {
    notFound();
  }

  const defaultValues: TestimonialFormInput = {
    authorName: testimonial.authorName,
    authorRole: testimonial.authorRole ?? "",
    authorAvatarUrl: testimonial.authorAvatarUrl ?? "",
    quote: testimonial.quote,
    order: testimonial.order,
    status: testimonial.status,
  };

  return (
    <>
      <AdminPageHeader
        title="Edit testimonial"
        breadcrumbs={[
          { label: "Testimonials", href: "/admin/testimonials" },
          { label: "Edit testimonial" },
        ]}
      />
      <TestimonialForm
        defaultValues={defaultValues}
        testimonialId={testimonial.id}
        submitLabel="Save changes"
      />
    </>
  );
}
