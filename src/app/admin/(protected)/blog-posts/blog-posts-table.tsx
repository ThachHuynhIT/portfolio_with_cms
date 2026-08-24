"use client";

import { NewspaperIcon } from "lucide-react";
import { AdminDataTable } from "@components/admin/admin-data-table";
import { blogPostColumns, type AdminBlogPostRow } from "./blog-posts-columns";

export function BlogPostsTable({ posts }: { posts: AdminBlogPostRow[] }) {
  return (
    <AdminDataTable
      caption="Blog posts"
      columns={blogPostColumns}
      data={posts}
      searchPlaceholder="Search blog posts..."
      emptyIcon={NewspaperIcon}
      emptyTitle="No blog posts yet"
      emptyDescription="Write your first post to share it on the public blog."
      emptyActionHref="/admin/blog-posts/new"
      emptyActionLabel="New blog post"
    />
  );
}
