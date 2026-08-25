import { notFound } from "next/navigation";
import { getBlogPostByIdAdmin } from "@lib/admin/blog-posts";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { BlogPostForm } from "../../blog-post-form";
import type { BlogPostFormInput } from "@lib/admin/blogpost-schema";

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
    <>
      <AdminPageHeader
        title="Edit blog post"
        breadcrumbs={[
          { label: "Blog posts", href: "/admin/blog-posts" },
          { label: "Edit blog post" },
        ]}
      />
      <BlogPostForm
        defaultValues={defaultValues}
        blogPostId={post.id}
        submitLabel="Save changes"
      />
    </>
  );
}
