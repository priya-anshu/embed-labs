import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside
      className="w-64 border-r border-(--border)
                 bg-(--card) text-(--card-foreground)"
    >
      <div className="p-4 font-bold text-lg">EmbedLabs Admin</div>

      <nav className="px-2 space-y-1">
        <Link href="/admin" className="block px-3 py-2 rounded hover:bg-(--muted)">
          Dashboard
        </Link>
        <Link href="/admin/courses" className="block px-3 py-2 rounded hover:bg-(--muted)">
          Courses
        </Link>
        <Link href="/admin/qr" className="block px-3 py-2 rounded hover:bg-(--muted)">
          QR Codes
        </Link>
      </nav>
    </aside>
  );
}
