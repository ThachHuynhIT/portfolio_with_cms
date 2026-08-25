import Link from "next/link";
import { getAllTestimonialsAdmin } from "@lib/admin/testimonials";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { Button } from "@components/ui/button";
import { TestimonialsTable } from "./testimonials-table";

export const metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  const testimonials = await getAllTestimonialsAdmin();

  return (
    <>
      <AdminPageHeader title="Testimonials">
        <Button nativeButton={false} render={<Link href="/admin/testimonials/new" />}>
          New testimonial
        </Button>
      </AdminPageHeader>
      <TestimonialsTable testimonials={testimonials} />
    </>
  );
}
