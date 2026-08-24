"use client";

import { useEffect, useId, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import { AdminEmptyState } from "./admin-empty-state";
import { adminTableFeatures, useAdminTable } from "./admin-table";
import styles from "./admin-data-table.module.scss";

const SEARCH_DEBOUNCE_MS = 150;

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon aria-hidden="true" />;
  if (sorted === "desc") return <ArrowDownIcon aria-hidden="true" />;
  return <ChevronsUpDownIcon aria-hidden="true" />;
}

function ariaSortFor(sorted: false | "asc" | "desc") {
  if (sorted === "asc") return "ascending" as const;
  if (sorted === "desc") return "descending" as const;
  return "none" as const;
}

export function AdminDataTable<TData extends { id: string }>({
  caption,
  columns,
  data,
  searchPlaceholder,
  toolbar,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
}: {
  caption: string;
  columns: ColumnDef<typeof adminTableFeatures, TData>[];
  data: TData[];
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
}) {
  const tableId = useId();
  const [searchInput, setSearchInput] = useState("");

  const table = useAdminTable(
    {
      columns,
      data,
      getRowId: (row) => row.id,
      globalFilterFn: "includesString",
    },
    (state) => state,
  );

  // Debounced so typing doesn't re-filter/re-render on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      table.setGlobalFilter(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `table` is a fresh instance each render; only the debounced input should retrigger this.
  }, [searchInput]);

  if (data.length === 0) {
    return (
      <AdminEmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionHref={emptyActionHref}
        actionLabel={emptyActionLabel}
      />
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <div className={styles.stack}>
      {(searchPlaceholder || toolbar) && (
        <div className={styles.toolbar}>
          {searchPlaceholder && (
            <div className={styles.search}>
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={searchPlaceholder}
                aria-controls={tableId}
                className={styles.searchInput}
              />
              <span className={styles.searchCount}>
                {rows.length} of {data.length}
              </span>
            </div>
          )}
          {toolbar}
        </div>
      )}

      <div
        role="region"
        tabIndex={0}
        aria-label={`${caption}, scrollable`}
        className={styles.tableWrapper}
      >
        <table id={tableId} className={styles.table}>
          <caption className={styles.caption}>{caption}</caption>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={canSort ? ariaSortFor(sorted) : undefined}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className={styles.sortButton}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <table.FlexRender header={header} />
                          <SortIcon sorted={sorted} />
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
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
    </div>
  );
}
