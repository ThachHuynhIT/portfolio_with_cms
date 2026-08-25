"use client";

import { ChevronDownIcon, LogOutIcon, UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import styles from "./admin-user-menu.module.scss";

export function AdminUserMenu({
  email,
  logoutAction,
}: {
  email: string;
  logoutAction: () => void | Promise<void>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={styles.trigger}>
        <UserIcon aria-hidden="true" className={styles.userIcon} />
        <span className={styles.email}>{email}</span>
        <ChevronDownIcon aria-hidden="true" className={styles.chevron} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void logoutAction();
          }}
        >
          <LogOutIcon aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
