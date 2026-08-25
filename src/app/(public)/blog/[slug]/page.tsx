import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug, getSiteSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { Markdown } from "@components/markdown/markdown";
import { RemoteImage } from "@components/public/remote-image";
import { formatDate } from "@/lib/format-date";
import styles from "./page.module.scss";

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const [post, settings] = await Promise.all([
    getBlogPostBySlug(slug),
    getSiteSettings(),
  ]);

  if (!post) {
    return {};
  }

  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImageUrl || settings?.ogImageUrl,
    type: "article",
    siteName: settings?.siteName,
  });
}

export default async function BlogPostPage(
  props: PageProps<"/blog/[slug]">,
) {
  const { slug } = await props.params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const settings = await getSiteSettings();

  return (
    <main id="main-content" className={styles.main}>
      <Link href="/blog" className={styles.backLink}>
        ← Back to blog
      </Link>
      {post.coverImageUrl && (
        <div className={styles.cover}>
          <RemoteImage
            src={post.coverImageUrl}
            alt=""
            priority
            sizes="(min-width: 704px) 704px, 100vw"
          />
        </div>
      )}
      <h1 className={styles.title}>{post.title}</h1>
      <div className={styles.byline}>
        {settings?.avatarUrl && (
          <div className={styles.authorAvatar}>
            <RemoteImage src={settings.avatarUrl} alt="" sizes="32px" />
          </div>
        )}
        <span className={styles.authorName}>
          {settings?.siteName || "Portfolio"}
        </span>
        {post.publishedAt && (
          <>
            <span className={styles.bylineDot} aria-hidden="true">
              &middot;
            </span>
            <time
              className={styles.publishedAt}
              dateTime={post.publishedAt.toISOString()}
            >
              {formatDate(post.publishedAt)}
            </time>
          </>
        )}
      </div>
      {post.tags.length > 0 && (
        <ul className={styles.tagList}>
          {post.tags.map((tag) => (
            <li key={tag} className={styles.tagPill}>
              {tag}
            </li>
          ))}
        </ul>
      )}
      <p className={styles.excerpt}>{post.excerpt}</p>
      <Markdown content={post.content} />
    </main>
  );
}
