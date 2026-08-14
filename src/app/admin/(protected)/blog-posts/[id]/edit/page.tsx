import { notFound } from "next/navigation";
import { getBlogPostByIdAdmin } from "@lib/admin/blog-posts";
import { BlogPostForm } from "../../blog-post-form";
import type { BlogPostFormInput } from "@lib/admin/blogpost-schema";
import styles from "./page.module.scss";

export const metadata = { title: "Edit blog post" };

export default async function EditBlogPostPage(
  props: PageProps<"/admin/blog-posts/[id]/edit">
) {
  const { id } = await props.params;
  const post = await getBlogPostByIdAdmin(id);

  if (!post) {
    notFound();
  }

  const defaultValues: BlogPostFormInput = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl ?? "",
    tags: post.tags.join(", "),
    status: post.status,
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Edit blog post</h1>
      <BlogPostForm
        defaultValues={defaultValues}
        blogPostId={post.id}
        submitLabel="Save changes"
      />
    </main>
  );
}
