import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm
                   bg-(--card) text-(--card-foreground)
                   border border-(--border)
                   rounded-lg p-6 space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">Sign in to EmbedLabs</h1>

        <div className="space-y-2">
          <label className="text-sm opacity-80">Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2 rounded
                       bg-(--background)
                       border border-(--border)
                       focus:outline-none focus:ring-2
                       focus:ring-(--primary)"
          />
        </div>

        <Link
          href="/verify"
          className="block text-center
                     bg-(--primary)
                     text-(--primary-foreground)
                     py-2 rounded font-medium"
        >
          Send OTP
        </Link>

        <p className="text-xs text-center opacity-70">
          We’ll send a one-time password to your email.
        </p>
      </div>
    </section>
  );
}
