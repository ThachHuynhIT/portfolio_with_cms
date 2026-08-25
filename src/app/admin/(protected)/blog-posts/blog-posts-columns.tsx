"use client";

import { createAdminColumnHelper } from "@components/admin/admin-table";
import { createRowActionsColumn } from "@components/admin/admin-row-actions";
import { StatusBadge } from "@components/admin/status-badge";
import { deleteBlogPostAction } from "./actions";

export type AdminBlogPostRow = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: Date | null;
  updatedAt: Date;
};

const columnHelper = createAdminColumnHelper<AdminBlogPostRow>();

export const blogPostColumns = columnHelper.columns([
  columnHelper.accessor("title", { header: "Title" }),
  columnHelper.accessor("slug", { header: "Slug" }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("publishedAt", {
    header: "Published",
    cell: (info) => info.getValue()?.toLocaleDateString() ?? "—",
  }),
  columnHelper.accessor("updatedAt", {
    header: "Updated",
    cell: (info) => info.getValue().toLocaleDateString(),
  }),
  createRowActionsColumn<AdminBlogPostRow>({
    entityName: "blog post",
    editHref: (row) => `/admin/blog-posts/${row.id}/edit`,
    getLabel: (row) => row.title,
    onDelete: (row) => deleteBlogPostAction(row.id),
  }),
]);
