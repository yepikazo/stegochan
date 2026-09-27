interface AlertProps {
  variant?: "error" | "success";
  children: React.ReactNode;
}

export default function Alert({ variant = "error", children }: AlertProps) {
  const styles =
    variant === "success"
      ? "border-[#4fbdb0] bg-[#142826] text-[#a9e6dd]"
      : "border-[#e5586b] bg-[#2a1a1e] text-[#f3b3bd]";

  return <div className={`mb-5 rounded-md border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}
