/**
 * /logout page - signs out and redirects to /login.
 *
 * Server-side sign out using Supabase auth.
 */

import { redirect } from "next/navigation";
import { signOutAction } from "@/features/auth";

export default async function LogoutPage() {
  await signOutAction();
  redirect("/login");
}

