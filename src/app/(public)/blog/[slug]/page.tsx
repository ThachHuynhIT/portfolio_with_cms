import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/queries";
import styles from "./page.module.scss";

export default async function BlogPostPage(
  props: PageProps<"/blog/[slug]">,
) {
  const { slug } = await props.params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{post.title}</h1>
      <p className={styles.excerpt}>{post.excerpt}</p>
      <p className={styles.content}>{post.content}</p>
    </main>
  );
}
