/**
 * /login page - minimal production auth UI.
 *
 * Server component handles session-based redirect.
 * If already authenticated, redirects to home.
 */

import { redirect } from "next/navigation";
import { isAuthenticated } from "@/features/auth";
import { LoginClient } from "./LoginClient";

export default async function LoginPage() {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    redirect("/");
  }

  return <LoginClient />;
}

