"use client";

import {
  columnFilteringFeature,
  createFilteredRowModel,
  createSortedRowModel,
  createTableHook,
  filterFns,
  globalFilteringFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from "@tanstack/react-table";

// Single place every admin table's v9 wiring goes through — a v9 API
// misuse (wrong feature registered, missing row-model factory) surfaces
// here instead of at 6 separate call sites.
export const adminTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  sortFns,
  filterFns,
});

export const { useAppTable: useAdminTable, createAppColumnHelper: createAdminColumnHelper } =
  createTableHook({ features: adminTableFeatures });
