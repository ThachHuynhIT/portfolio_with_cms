import Link from "next/link";
import { getPublishedBlogPosts } from "@/lib/queries";
import styles from "./page.module.scss";

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Blog</h1>
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/blog/${post.slug}`} className={styles.card}>
              <span className={styles.cardTitle}>{post.title}</span>
              <p className={styles.excerpt}>{post.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
