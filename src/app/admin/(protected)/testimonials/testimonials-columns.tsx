"use client";

import { createAdminColumnHelper } from "@components/admin/admin-table";
import { createRowActionsColumn } from "@components/admin/admin-row-actions";
import { StatusBadge } from "@components/admin/status-badge";
import { deleteTestimonialAction } from "./actions";

export type AdminTestimonialRow = {
  id: string;
  authorName: string;
  authorRole: string | null;
  status: "DRAFT" | "PUBLISHED";
  order: number;
};

const columnHelper = createAdminColumnHelper<AdminTestimonialRow>();

export const testimonialColumns = columnHelper.columns([
  columnHelper.accessor("authorName", { header: "Author" }),
  columnHelper.accessor("authorRole", {
    header: "Role",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("order", { header: "Order" }),
  createRowActionsColumn<AdminTestimonialRow>({
    entityName: "testimonial",
    editHref: (row) => `/admin/testimonials/${row.id}/edit`,
    getLabel: (row) => row.authorName,
    onDelete: (row) => deleteTestimonialAction(row.id),
  }),
]);
