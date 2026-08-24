import { Suspense } from "react";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { DashboardContent } from "./dashboard-content";
import { DashboardSkeleton } from "./dashboard-skeleton";

export const metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="An overview of your content and what needs attention."
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
