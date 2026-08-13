import { LoginForm } from "./login-form";
import styles from "./page.module.scss";

export const metadata = {
  title: "Admin login",
};

export default function AdminLoginPage() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin login</h1>
        <LoginForm />
      </div>
    </main>
  );
}
