import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold">
          EmbedLabs
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/learn"
            className="text-sm font-medium hover:underline"
          >
            Learn
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
