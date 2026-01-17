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
      <h1 className="text-2xl font-bold text-white-700 text-center mb-4 mt-4">
        Login
      </h1>

      <form
        action={handleSubmit}
        className="flex flex-col gap-2 w-full max-w-md mx-auto p-4 border
      border-gray-200 rounded-md shadow-md transition-all duration-300
      hover:shadow-lg hover:border-gray-300 hover:bg-black-50
      hover:scale-105 hover:cursor-pointer hover:translate-y-0.5
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-white-700 ">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="flex flex-col gap-2 text-sm font-medium text-white-700 ">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>
        <div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            Sign in
          </button>
        </div>
      </form>

      <div className="w-1/2 mx-auto text-sm text-gray-500 mt-4 text-center hover:cursor-pointer hover:text-blue-600 hover:underline">
        <button
          type="button"
          onClick={() => {
            router.push("/auth/google");
          }}
          disabled={isPending}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:cursor-pointer hover:translate-y-0.5 hover:scale-105 transition-all duration-300"
        >
          Continue with Google
        </button>
      </div>
      <div className="text-sm text-gray-500 mt-4 text-center">
        <p className="mb-2 text-sm font-medium text-white-700  ">
          Pending: {isPending ? "yes" : "no"}
        </p>
        <p className="text-sm font-medium text-white-700  ">
          Error: {error ?? "-"}
        </p>
      </div>
    </main>
  );
}
