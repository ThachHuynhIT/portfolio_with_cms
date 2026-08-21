import Link from "next/link";
import { getPublishedBlogPosts } from "@/lib/queries";
import { RemoteImage } from "@components/public/remote-image";
import { EmptyState } from "@components/public/empty-state";
import { Stagger } from "@components/motion/stagger";
import { formatDate } from "@/lib/format-date";
import styles from "./page.module.scss";

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <main id="main-content" className={styles.main}>
      <h1 className={styles.title}>Blog</h1>
      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Check back soon for new writing."
        />
      ) : (
        <Stagger className={styles.list}>
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className={styles.card}>
              {post.coverImageUrl && (
                <div className={styles.cardCover}>
                  <RemoteImage src={post.coverImageUrl} alt="" sizes="128px" />
                </div>
              )}
              <div className={styles.cardBody}>
                {post.publishedAt && (
                  <time
                    className={styles.postDate}
                    dateTime={post.publishedAt.toISOString()}
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                )}
                <span className={styles.cardTitle}>{post.title}</span>
                <p className={styles.excerpt}>{post.excerpt}</p>
                {post.tags.length > 0 && (
                  <ul className={styles.tagList}>
                    {post.tags.slice(0, 4).map((tag) => (
                      <li key={tag} className={styles.tagPill}>
                        {tag}
                      </li>
                    ))}
                    {post.tags.length > 4 && (
                      <li className={styles.tagPill}>
                        +{post.tags.length - 4}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </Link>
          ))}
        </Stagger>
      )}
    </main>
  );
}
