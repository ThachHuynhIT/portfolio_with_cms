import { ContactForm } from "./contact-form";
import styles from "./page.module.scss";

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
