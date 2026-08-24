"use client";

import { createAdminColumnHelper } from "@components/admin/admin-table";
import { createRowActionsColumn } from "@components/admin/admin-row-actions";
import { StatusBadge } from "@components/admin/status-badge";
import { deleteProjectAction } from "./actions";

export type AdminProjectRow = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  order: number;
  updatedAt: Date;
};

const columnHelper = createAdminColumnHelper<AdminProjectRow>();

export const projectColumns = columnHelper.columns([
  columnHelper.accessor("title", { header: "Title" }),
  columnHelper.accessor("slug", { header: "Slug" }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("featured", {
    header: "Featured",
    cell: (info) => (info.getValue() ? "Yes" : "No"),
  }),
  columnHelper.accessor("order", { header: "Order" }),
  columnHelper.accessor("updatedAt", {
    header: "Updated",
    cell: (info) => info.getValue().toLocaleDateString(),
  }),
  createRowActionsColumn<AdminProjectRow>({
    entityName: "project",
    editHref: (row) => `/admin/projects/${row.id}/edit`,
    getLabel: (row) => row.title,
    onDelete: (row) => deleteProjectAction(row.id),
  }),
]);
