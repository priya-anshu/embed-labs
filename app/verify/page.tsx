"use client";

import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();

  function handleLogin(role: "user" | "admin") {
    document.cookie = "logged_in=true; path=/";
    document.cookie = `role=${role}; path=/`;
    router.push("/");
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm p-6 space-y-4 border rounded">
        <h1 className="text-xl font-bold text-center">Verify OTP</h1>

        <button
          onClick={() => handleLogin("user")}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login as User
        </button>

        <button
          onClick={() => handleLogin("admin")}
          className="w-full bg-black text-white py-2 rounded"
        >
          Login as Admin
        </button>
      </div>
    </section>
  );
}
