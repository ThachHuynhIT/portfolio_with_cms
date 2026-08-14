import { TestimonialForm } from "../testimonial-form";
import type { TestimonialFormInput } from "@lib/admin/testimonial-schema";
import styles from "./page.module.scss";

const emptyDefaults: TestimonialFormInput = {
  authorName: "",
  authorRole: "",
  authorAvatarUrl: "",
  quote: "",
  order: 0,
  status: "DRAFT",
};

export const metadata = { title: "New testimonial" };

export default function NewTestimonialPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>New testimonial</h1>
      <TestimonialForm
        defaultValues={emptyDefaults}
        submitLabel="Create testimonial"
      />
    </main>
  );
}
