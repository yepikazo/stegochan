interface AlertProps {
  variant?: "error" | "success";
  children: React.ReactNode;
}

export default function Alert({ variant = "error", children }: AlertProps) {
  return <div className={`alert${variant === "success" ? " success" : ""}`}>{children}</div>;
}
