/**
 * Admin dashboard shell.
 *
 * Minimal, unstyled placeholder. Access should be restricted
 * to admin role via server-side checks and routing.
 */

import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/features/auth";

export default async function AdminPage() {
  const role = await getCurrentUserRole();

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p>This is a placeholder for the admin dashboard.</p>
    </main>
  );
}

