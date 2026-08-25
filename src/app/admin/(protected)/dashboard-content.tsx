import Link from "next/link";
import {
  BriefcaseIcon,
  CircleCheckIcon,
  FolderIcon,
  InboxIcon,
  MessageSquareIcon,
  NewspaperIcon,
  SettingsIcon,
  SparklesIcon,
} from "lucide-react";
import { getSiteSettings } from "@/lib/queries";
import { getAdminDashboardData } from "@lib/admin/dashboard";
import { AdminEmptyState } from "@components/admin/admin-empty-state";
import { AdminStatCard } from "@components/admin/admin-stat-card";
import { Button } from "@components/ui/button";
import { StatusBadge } from "@components/admin/status-badge";
import styles from "./dashboard-content.module.scss";

export async function DashboardContent() {
  const [data, settings] = await Promise.all([
    getAdminDashboardData(),
    getSiteSettings(),
  ]);

  const setupIncomplete = !settings?.siteName || !settings?.heroHeadline;
  const hasNeedsAttention =
    data.draftItems.length > 0 || data.unreadMessages.total > 0 || setupIncomplete;

  return (
    <div className={styles.stack}>
      <div className={styles.statGrid}>
        <AdminStatCard
          label="Projects"
          value={data.projects.total}
          hint={`${data.projects.draft} draft${data.projects.draft === 1 ? "" : "s"}`}
          href="/admin/projects"
          icon={FolderIcon}
        />
        <AdminStatCard
          label="Blog posts"
          value={data.blogPosts.total}
          hint={`${data.blogPosts.draft} draft${data.blogPosts.draft === 1 ? "" : "s"}`}
          href="/admin/blog-posts"
          icon={NewspaperIcon}
        />
        <AdminStatCard
          label="Skills"
          value={data.skills.total}
          href="/admin/skills"
          icon={SparklesIcon}
        />
        <AdminStatCard
          label="Experience"
          value={data.experience.total}
          href="/admin/experience"
          icon={BriefcaseIcon}
        />
        <AdminStatCard
          label="Testimonials"
          value={data.testimonials.total}
          hint={`${data.testimonials.draft} draft${data.testimonials.draft === 1 ? "" : "s"}`}
          href="/admin/testimonials"
          icon={MessageSquareIcon}
        />
        <AdminStatCard
          label="Unread messages"
          value={data.unreadMessages.total}
          href="/admin/contact-messages"
          icon={InboxIcon}
          tone={data.unreadMessages.total > 0 ? "warning" : "default"}
        />
      </div>

      <section className={styles.section} aria-labelledby="needs-attention-heading">
        <h2 id="needs-attention-heading" className={styles.sectionTitle}>
          Needs attention
        </h2>
        {hasNeedsAttention ? (
          <ul className={styles.attentionList}>
            {data.draftItems.map((item) => (
              <li key={`${item.kind}-${item.id}`} className={styles.attentionRow}>
                <StatusBadge status="DRAFT" />
                <span className={styles.attentionTitle}>{item.title}</span>
                <Link
                  href={`/admin/${item.kind === "project" ? "projects" : "blog-posts"}/${item.id}/edit`}
                  className={styles.attentionLink}
                >
                  Edit
                </Link>
              </li>
            ))}
            {data.unreadMessages.total > 0 && (
              <li className={styles.attentionRow}>
                <span className={styles.attentionTitle}>
                  {data.unreadMessages.total} unread message
                  {data.unreadMessages.total === 1 ? "" : "s"}
                </span>
                <Link href="/admin/contact-messages" className={styles.attentionLink}>
                  View
                </Link>
              </li>
            )}
            {setupIncomplete && (
              <li className={styles.attentionRow}>
                <span className={styles.attentionTitle}>
                  Site setup is incomplete (site name or hero headline is empty)
                </span>
                <Link href="/admin/settings" className={styles.attentionLink}>
                  Finish setup
                </Link>
              </li>
            )}
          </ul>
        ) : (
          <AdminEmptyState
            icon={CircleCheckIcon}
            title="You're all caught up"
            description="No drafts, unread messages, or setup steps need attention."
          />
        )}
      </section>

      <section className={styles.section} aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className={styles.sectionTitle}>
          Quick actions
        </h2>
        <div className={styles.quickActions}>
          <Button nativeButton={false} render={<Link href="/admin/projects/new" />}>
            <FolderIcon aria-hidden="true" />
            New project
          </Button>
          <Button nativeButton={false} render={<Link href="/admin/blog-posts/new" />}>
            <NewspaperIcon aria-hidden="true" />
            New blog post
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/settings" />}
          >
            <SettingsIcon aria-hidden="true" />
            Edit settings
          </Button>
        </div>
      </section>
    </div>
  );
}
