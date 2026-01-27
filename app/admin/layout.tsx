    import type { ReactNode } from "react";
    import AdminSidebar from "@/components/admin/AdminSidebar";

    export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 bg-background p-8">{children}</main>
        </div>
    );
    }
