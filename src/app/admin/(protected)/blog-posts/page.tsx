import Link from "next/link";
import { getAllBlogPostsAdmin } from "@lib/admin/blog-posts";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { Button } from "@components/ui/button";
import { BlogPostsTable } from "./blog-posts-table";

export const metadata = { title: "Blog posts" };

export default async function AdminBlogPostsPage() {
  const posts = await getAllBlogPostsAdmin();

  return (
    <>
      <AdminPageHeader title="Blog posts">
        <Button render={<Link href="/admin/blog-posts/new" />}>
          New blog post
        </Button>
      </AdminPageHeader>
      <BlogPostsTable posts={posts} />
    </>
  );
}
