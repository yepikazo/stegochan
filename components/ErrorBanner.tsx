"use client";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-7 rounded-xl border border-[#8b3a3a] bg-[#3b1f1f] px-4 py-3 text-sm text-[#f08080]">
      {message}
    </div>
  );
}
