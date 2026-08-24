"use client";

import { createAdminColumnHelper } from "@components/admin/admin-table";
import { createRowActionsColumn } from "@components/admin/admin-row-actions";
import { deleteSkillAction } from "./actions";

export type AdminSkillRow = {
  id: string;
  name: string;
  category: string;
  order: number;
};

const columnHelper = createAdminColumnHelper<AdminSkillRow>();

export const skillColumns = columnHelper.columns([
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("category", { header: "Category" }),
  columnHelper.accessor("order", { header: "Order" }),
  createRowActionsColumn<AdminSkillRow>({
    entityName: "skill",
    editHref: (row) => `/admin/skills/${row.id}/edit`,
    getLabel: (row) => row.name,
    onDelete: (row) => deleteSkillAction(row.id),
  }),
]);
