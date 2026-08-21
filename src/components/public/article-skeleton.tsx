import styles from "./article-skeleton.module.scss";

// Shared shape for both projects/[slug]/loading.tsx and blog/[slug]/loading.tsx
// (Phase 10 PR 8/9) — both detail pages have the same back-link + cover +
// title + meta-row + body-lines structure, so this is written once. Sits
// directly inside a <main> that already applies section-stack, hence no
// wrapper of its own.
export function ArticleSkeleton() {
  return (
    <>
      <div className={styles.backLinkSkeleton} />
      <div className={styles.coverSkeleton} />
      <div className={styles.titleSkeleton} />
      <div className={styles.metaSkeleton} />
      <div className={styles.lineSkeleton} />
      <div className={styles.lineSkeleton} />
      <div className={styles.lineSkeletonShort} />
    </>
  );
}
