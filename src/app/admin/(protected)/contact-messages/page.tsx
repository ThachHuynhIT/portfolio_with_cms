import { getAllContactMessagesAdmin } from "@lib/admin/contact-messages";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { ContactMessagesTable } from "./contact-messages-table";

export const metadata = { title: "Messages" };

export default async function AdminContactMessagesPage() {
  const messages = await getAllContactMessagesAdmin();

  return (
    <>
      <AdminPageHeader title="Messages" />
      <ContactMessagesTable messages={messages} />
    </>
  );
}
