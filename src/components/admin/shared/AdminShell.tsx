"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/shared/Sidebar";

// /admin/login fica fora do shell — sidebar só faz sentido pós-login
// (decisão do Product Owner, Sprint DS.2).
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-cream md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
