/**
 * Client-side login UI.
 *
 * Minimal, unstyled form for email/password and Google login.
 * Uses server action for authentication.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail } from "./actions";

export function LoginClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setError(null);
      const result = await loginWithEmail(formData);
      if (!result.success) {
        setError(result.error ?? "Login failed.");
        return;
      }
      router.push("/");
      router.refresh();
    });
  };

  return (
    <main>
      <h1>Login</h1>
      <form action={handleSubmit}>
        <div>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" />
          </label>
        </div>
        <div>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" />
          </label>
        </div>
        <div>
          <button type="submit" disabled={isPending}>
            Sign in
          </button>
        </div>
      </form>
      <div>
        <button
          type="button"
          onClick={() => {
            router.push("/auth/google");
          }}
          disabled={isPending}
        >
          Continue with Google
        </button>
      </div>
      <div>
        <p>Pending: {isPending ? "yes" : "no"}</p>
        <p>Error: {error ?? "-"}</p>
      </div>
    </main>
  );
}

