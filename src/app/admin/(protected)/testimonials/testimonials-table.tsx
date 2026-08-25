"use client";

import { MessageSquareIcon } from "lucide-react";
import { AdminDataTable } from "@components/admin/admin-data-table";
import {
  testimonialColumns,
  type AdminTestimonialRow,
} from "./testimonials-columns";

export function TestimonialsTable({
  testimonials,
}: {
  testimonials: AdminTestimonialRow[];
}) {
  return (
    <AdminDataTable
      caption="Testimonials"
      columns={testimonialColumns}
      data={testimonials}
      searchPlaceholder="Search testimonials..."
      emptyIcon={MessageSquareIcon}
      emptyTitle="No testimonials yet"
      emptyDescription="Add a testimonial to show social proof on the home page."
      emptyActionHref="/admin/testimonials/new"
      emptyActionLabel="New testimonial"
    />
  );
}
