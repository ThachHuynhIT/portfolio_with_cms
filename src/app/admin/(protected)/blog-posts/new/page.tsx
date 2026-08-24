import { AdminPageHeader } from "@components/admin/admin-page-header";
import { BlogPostForm } from "../blog-post-form";
import type { BlogPostFormInput } from "@lib/admin/blogpost-schema";

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
    <>
      <AdminPageHeader
        title="New blog post"
        breadcrumbs={[
          { label: "Blog posts", href: "/admin/blog-posts" },
          { label: "New blog post" },
        ]}
      />
      <BlogPostForm defaultValues={emptyDefaults} submitLabel="Create blog post" />
    </>
  );
}
