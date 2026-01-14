/**
 * Root route - role-based router.
 *
 * This page does not render UI. It redirects users to the
 * appropriate dashboard based on their role.
 */

import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/features/auth";

export default async function Home() {
  const role = await getCurrentUserRole();

  if (role === "admin") {
    redirect("/admin");
  }

  if (role === "user") {
    redirect("/dashboard");
  }

  // Fallback: unauthenticated users should already be redirected by middleware.
  // If they reach here, send them to login.
  redirect("/login");
}
