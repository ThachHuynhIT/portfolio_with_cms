import { ArticleSkeleton } from "@components/public/article-skeleton";
import styles from "./loading.module.scss";

export default function ProjectDetailLoading() {
  return (
    <main id="main-content" className={styles.main} aria-busy="true">
      <span className={styles.srOnly}>Loading…</span>
      <ArticleSkeleton />
    </main>
  );
}
