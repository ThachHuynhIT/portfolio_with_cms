import Link from "next/link";
import { getAllTestimonialsAdmin } from "@lib/admin/testimonials";
import { Button } from "@components/ui/button";
import { TestimonialsTable } from "./testimonials-table";
import styles from "./page.module.scss";

export const metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  const testimonials = await getAllTestimonialsAdmin();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Testimonials</h1>
        <Button render={<Link href="/admin/testimonials/new" />}>
          New testimonial
        </Button>
      </div>
      <TestimonialsTable testimonials={testimonials} />
    </main>
  );
}
