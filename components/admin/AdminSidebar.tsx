    "use client";

    import Link from "next/link";
    import { usePathname } from "next/navigation";

    const navItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Kits", href: "/admin/kits" },
    { label: "Content", href: "/admin/content" },
    { label: "Audit Logs", href: "/admin/audit" },
    ];

    export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-background p-4">
        <h2 className="mb-8 text-xl font-semibold">Admin Panel</h2>

        <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
                <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-2 text-sm transition
                    ${
                    isActive
                        ? "bg-muted font-medium"
                        : "hover:bg-muted/60"
                    }`}
                >
                {item.label}
                </Link>
            );
            })}
        </nav>
        </aside>
    );
    }
