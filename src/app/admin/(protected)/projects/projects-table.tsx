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
import { deleteProjectAction } from "./actions";
import styles from "./projects-table.module.scss";

export type AdminProjectRow = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  order: number;
  updatedAt: Date;
};

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, AdminProjectRow>();

export function ProjectsTable({ projects }: { projects: AdminProjectRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, title: string) {
    startTransition(async () => {
      const result = await deleteProjectAction(id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Deleted "${title}".`);
      router.refresh();
    });
  }

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("title", { header: "Title" }),
        columnHelper.accessor("slug", { header: "Slug" }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: (info) =>
            info.getValue() === "PUBLISHED" ? "Published" : "Draft",
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
        columnHelper.display({
          id: "actions",
          header: "Actions",
          enableSorting: false,
          cell: (info) => {
            const { id, title } = info.row.original;
            return (
              <div className={styles.actions}>
                <Link href={`/admin/projects/${id}/edit`}>Edit</Link>
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
                      <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently deletes &ldquo;{title}&rdquo;. This
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isPending}
                        onClick={() => handleDelete(id, title)}
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

  const table = useTable({ features, columns, data: projects }, (state) => state);

  if (projects.length === 0) {
    return <p className={styles.empty}>No projects yet.</p>;
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
