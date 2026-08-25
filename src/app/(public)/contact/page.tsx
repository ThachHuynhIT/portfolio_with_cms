import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { ContactForm } from "./contact-form";
import styles from "./page.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildMetadata({
    title: "Contact",
    description:
      "Have a project in mind or just want to say hello? Send a message.",
    path: "/contact",
    image: settings?.ogImageUrl,
    siteName: settings?.siteName,
  });
}

export default function ContactPage() {
  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.intro}>
        <h1 className={styles.title}>Contact</h1>
        <p className={styles.subtitle}>
          Have a project in mind or just want to say hello? Send a message
          below.
        </p>
      </section>
      <ContactForm />
    </main>
  );
}
