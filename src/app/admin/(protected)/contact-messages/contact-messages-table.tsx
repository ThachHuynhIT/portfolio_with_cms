"use client";

import { InboxIcon } from "lucide-react";
import { AdminDataTable } from "@components/admin/admin-data-table";
import {
  contactMessageColumns,
  type AdminContactMessageRow,
} from "./contact-messages-columns";

// No `searchPlaceholder` — ContactMessage rows come from the public contact
// form (not author-controlled) and can grow unbounded, so this is the one
// table that should eventually get server-side search/pagination instead of
// AdminDataTable's client-side global filter (see the design spec's §8.2).
export function ContactMessagesTable({
  messages,
}: {
  messages: AdminContactMessageRow[];
}) {
  return (
    <AdminDataTable
      caption="Messages"
      columns={contactMessageColumns}
      data={messages}
      emptyIcon={InboxIcon}
      emptyTitle="No messages yet"
      emptyDescription="Messages submitted through the public contact form will show up here."
    />
  );
}
