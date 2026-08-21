"use client";

import Link from "next/link";
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import styles from "./contact-messages-table.module.scss";

export type AdminContactMessageRow = {
  id: string;
  name: string;
  subject: string | null;
  read: boolean;
  createdAt: Date;
};

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<
  typeof features,
  AdminContactMessageRow
>();

const columns = columnHelper.columns([
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
  columnHelper.display({
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: (info) => (
      <div className={styles.actions}>
        <Link href={`/admin/contact-messages/${info.row.original.id}`}>
          View
        </Link>
      </div>
    ),
  }),
]);

export function ContactMessagesTable({
  messages,
}: {
  messages: AdminContactMessageRow[];
}) {
  const table = useTable({ features, columns, data: messages }, (state) => state);

  if (messages.length === 0) {
    return <p className={styles.empty}>No messages yet.</p>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : (
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={header.column.getToggleSortingHandler()}
                      disabled={!header.column.getCanSort()}
                    >
                      <table.FlexRender header={header} />
                      {{ asc: " ↑", desc: " ↓" }[
                        header.column.getIsSorted() as string
                      ] ?? null}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
