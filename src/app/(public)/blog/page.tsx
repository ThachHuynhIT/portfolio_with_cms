import Link from "next/link";
import { getPublishedBlogPosts } from "@/lib/queries";

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-16 max-w-3xl mx-auto w-full">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      <ul className="flex flex-col gap-6">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className="text-lg font-medium underline underline-offset-4"
            >
              {post.title}
            </Link>
            <p className="text-sm text-muted-foreground">{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
