import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/queries";

export default async function BlogPostPage(
  props: PageProps<"/blog/[slug]">,
) {
  const { slug } = await props.params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-16 max-w-3xl mx-auto w-full">
      <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
      <p className="text-muted-foreground">{post.excerpt}</p>
      <p className="whitespace-pre-wrap">{post.content}</p>
    </main>
  );
}
