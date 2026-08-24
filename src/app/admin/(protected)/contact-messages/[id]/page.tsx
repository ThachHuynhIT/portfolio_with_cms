import { notFound } from "next/navigation";
import { getContactMessageByIdAdmin } from "@lib/admin/contact-messages";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { Button } from "@components/ui/button";
import { setContactMessageReadAction } from "../actions";
import styles from "./page.module.scss";

export const metadata = { title: "Message" };

export default async function ContactMessagePage(
  props: PageProps<"/admin/contact-messages/[id]">
) {
  const { id } = await props.params;
  const message = await getContactMessageByIdAdmin(id);

  if (!message) {
    notFound();
  }

  const messageId = message.id;
  const nextReadState = !message.read;
  const title = message.subject || "(no subject)";

  async function toggleReadAction() {
    "use server";
    await setContactMessageReadAction(messageId, nextReadState);
  }

  return (
    <>
      <AdminPageHeader
        title={title}
        breadcrumbs={[
          { label: "Messages", href: "/admin/contact-messages" },
          { label: title },
        ]}
      >
        <form action={toggleReadAction}>
          <Button type="submit" variant="outline">
            {message.read ? "Mark as unread" : "Mark as read"}
          </Button>
        </form>
      </AdminPageHeader>

      <dl className={styles.meta}>
        <div>
          <dt>From</dt>
          <dd>{message.name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${message.email}`}>{message.email}</a>
          </dd>
        </div>
        <div>
          <dt>Received</dt>
          <dd>
            {message.createdAt.toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </dd>
        </div>
      </dl>

      {/* Plain text on purpose — this is input from a stranger, not
          author-controlled content, so it never goes through <Markdown>. */}
      <p className={styles.body}>{message.message}</p>
    </>
  );
}
