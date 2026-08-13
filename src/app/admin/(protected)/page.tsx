import { auth } from "@/auth";
import { Button } from "@components/ui/button";
import { logoutAction } from "./actions";
import styles from "./page.module.scss";

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <main className={styles.main}>
      <p>Signed in as {session?.user?.email}</p>
      <form action={logoutAction}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </main>
  );
}
