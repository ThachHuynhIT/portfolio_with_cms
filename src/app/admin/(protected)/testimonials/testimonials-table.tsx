"use client";

import { useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@components/ui/alert-dialog";
import { deleteTestimonialAction } from "./actions";
import styles from "./testimonials-table.module.scss";

export type AdminTestimonialRow = {
  id: string;
  authorName: string;
  authorRole: string | null;
  status: "DRAFT" | "PUBLISHED";
  order: number;
};

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, AdminTestimonialRow>();

export function TestimonialsTable({
  testimonials,
}: {
  testimonials: AdminTestimonialRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, authorName: string) {
    startTransition(async () => {
      const result = await deleteTestimonialAction(id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Deleted "${authorName}".`);
      router.refresh();
    });
  }

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("authorName", { header: "Author" }),
        columnHelper.accessor("authorRole", {
          header: "Role",
          cell: (info) => info.getValue() ?? "—",
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: (info) =>
            info.getValue() === "PUBLISHED" ? "Published" : "Draft",
        }),
        columnHelper.accessor("order", { header: "Order" }),
        columnHelper.display({
          id: "actions",
          header: "Actions",
          enableSorting: false,
          cell: (info) => {
            const { id, authorName } = info.row.original;
            return (
              <div className={styles.actions}>
                <Link href={`/admin/testimonials/${id}/edit`}>Edit</Link>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button type="button" variant="destructive" size="sm" />
                    }
                  >
                    Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete this testimonial?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently deletes &ldquo;{authorName}&rdquo;.
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isPending}
                        onClick={() => handleDelete(id, authorName)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          },
        }),
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPending]
  );

  const table = useTable(
    { features, columns, data: testimonials },
    (state) => state
  );

  if (testimonials.length === 0) {
    return <p className={styles.empty}>No testimonials yet.</p>;
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
