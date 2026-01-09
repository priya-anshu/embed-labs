import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/routeGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!requireAdmin()) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {children}
    </div>
  );
}
