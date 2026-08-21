import { getAllContactMessagesAdmin } from "@lib/admin/contact-messages";
import { ContactMessagesTable } from "./contact-messages-table";
import styles from "./page.module.scss";

export const metadata = { title: "Messages" };

export default async function AdminContactMessagesPage() {
  const messages = await getAllContactMessagesAdmin();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Messages</h1>
      </div>
      <ContactMessagesTable messages={messages} />
    </main>
  );
}
