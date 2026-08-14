import Link from "next/link";
import { getAllBlogPostsAdmin } from "@lib/admin/blog-posts";
import { Button } from "@components/ui/button";
import { BlogPostsTable } from "./blog-posts-table";
import styles from "./page.module.scss";

export const metadata = { title: "Blog posts" };

export default async function AdminBlogPostsPage() {
  const posts = await getAllBlogPostsAdmin();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Blog posts</h1>
        <Button render={<Link href="/admin/blog-posts/new" />}>
          New blog post
        </Button>
      </div>
      <BlogPostsTable posts={posts} />
    </main>
  );
}
