import { BlogPostForm } from "../blog-post-form";
import type { BlogPostFormInput } from "@lib/admin/blogpost-schema";
import styles from "./page.module.scss";

const emptyDefaults: BlogPostFormInput = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  tags: "",
  status: "DRAFT",
  seoTitle: "",
  seoDescription: "",
};

export const metadata = { title: "New blog post" };

export default function NewBlogPostPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>New blog post</h1>
      <BlogPostForm defaultValues={emptyDefaults} submitLabel="Create blog post" />
    </main>
  );
}
