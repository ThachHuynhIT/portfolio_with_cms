"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ColumnDef, RowData } from "@tanstack/react-table";
import { toast } from "sonner";
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
import { Button } from "@components/ui/button";
import type { adminTableFeatures } from "./admin-table";
import styles from "./admin-row-actions.module.scss";

type DeleteResult = { error: string } | undefined;

// Pending state lives here, inside the cell, instead of in the column
// definitions' closure — that's what lets the columns array be a
// module-level constant with no `useMemo`/`[isPending]` dependency dance.
function AdminRowActionsCell<TData extends RowData>({
  row,
  entityName,
  editHref,
  getLabel,
  onDelete,
}: {
  row: TData;
  entityName: string;
  editHref: (row: TData) => string;
  getLabel: (row: TData) => string;
  onDelete: (row: TData) => Promise<DeleteResult>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const label = getLabel(row);

  function handleDelete() {
    startTransition(async () => {
      const result = await onDelete(row);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Deleted "${label}".`);
      router.refresh();
    });
  }

  return (
    <div className={styles.actions}>
      <Link href={editHref(row)}>Edit</Link>
      <AlertDialog>
        <AlertDialogTrigger
          render={<Button type="button" variant="destructive" size="sm" />}
        >
          Delete
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {entityName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes &ldquo;{label}&rdquo;. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function createRowActionsColumn<TData extends RowData>({
  entityName,
  editHref,
  getLabel,
  onDelete,
}: {
  entityName: string;
  editHref: (row: TData) => string;
  getLabel: (row: TData) => string;
  onDelete: (row: TData) => Promise<DeleteResult>;
}): ColumnDef<typeof adminTableFeatures, TData, unknown> {
  return {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: (info) => (
      <AdminRowActionsCell
        row={info.row.original}
        entityName={entityName}
        editHref={editHref}
        getLabel={getLabel}
        onDelete={onDelete}
      />
    ),
  };
}
