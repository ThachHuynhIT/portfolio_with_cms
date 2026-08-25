import styles from "./admin-form-shell.module.scss";

export function AdminFormShell({
  width = "md",
  onSubmit,
  children,
}: {
  width?: "md" | "lg";
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
}) {
  return (
    <form
      className={width === "lg" ? styles.formLg : styles.form}
      onSubmit={onSubmit}
      noValidate
    >
      {children}
    </form>
  );
}
