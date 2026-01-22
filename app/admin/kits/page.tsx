/**
 * Admin page: Kit management.
 * 
 * SECURITY-FIRST:
 * - Server-side role check (admin only)
 * - Lists all kits with create/disable actions
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth";
import { getCurrentUserRole } from "@/features/auth/services/role";
import { getAllKits } from "@/features/qr/services/read";
import { CreateKitForm } from "./CreateKitForm";
import { KitList } from "./KitList";

export default async function AdminKitsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const role = await getCurrentUserRole();
  if (role !== "admin") {
    redirect("/dashboard");
  }

  const kits = await getAllKits();

  return (
    <div>
      <h1>Kit Management</h1>
      <div>
        <h2>Create New Kit</h2>
        <CreateKitForm />
      </div>
      <div>
        <h2>All Kits</h2>
        <KitList kits={kits} />
      </div>
    </div>
  );
}
