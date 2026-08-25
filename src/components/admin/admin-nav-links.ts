import {
  BriefcaseIcon,
  FolderIcon,
  InboxIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  NewspaperIcon,
  SettingsIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react";

export type AdminNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV: AdminNavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/projects", label: "Projects", icon: FolderIcon },
  { href: "/admin/blog-posts", label: "Blog posts", icon: NewspaperIcon },
  { href: "/admin/skills", label: "Skills", icon: SparklesIcon },
  { href: "/admin/experience", label: "Experience", icon: BriefcaseIcon },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: MessageSquareIcon,
  },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
  { href: "/admin/contact-messages", label: "Messages", icon: InboxIcon },
];

// "/admin" itself must only be active on the dashboard route — every other
// admin route also starts with "/admin", so a plain `startsWith` would light
// up "Dashboard" everywhere. Nested routes (e.g. "/admin/skills/new") stay
// active on their list link via the "/" boundary check.
export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
