"use client";

import Link from "next/link";
import { createAdminColumnHelper } from "@components/admin/admin-table";

export type AdminContactMessageRow = {
  id: string;
  name: string;
  subject: string | null;
  read: boolean;
  createdAt: Date;
};

const columnHelper = createAdminColumnHelper<AdminContactMessageRow>();

export const contactMessageColumns = columnHelper.columns([
  columnHelper.accessor("read", {
    header: "Read",
    cell: (info) => (info.getValue() ? "Read" : "Unread"),
  }),
  columnHelper.accessor("name", { header: "From" }),
  columnHelper.accessor("subject", {
    header: "Subject",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.accessor("createdAt", {
    header: "Received",
    cell: (info) =>
      info.getValue().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  }),
  // No createRowActionsColumn here on purpose — admin never deletes a
  // ContactMessage (Phase 9), just views/toggles read state on its own page.
  columnHelper.display({
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: (info) => (
      <Link href={`/admin/contact-messages/${info.row.original.id}`}>
        View
      </Link>
    ),
  }),
]);
