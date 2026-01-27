/**
 * Admin page: Content list and upload.
 *
 * SECURITY: Server-side role check (admin only).
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/features/auth";
import { getCurrentUserRole } from "@/features/auth/services/role";
import { listContents } from "@/features/qr/services/admin/contents";
import { UploadForm } from "./UploadForm";
import { ContentList } from "./ContentList";

export default async function AdminContentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const role = await getCurrentUserRole();
  if (role !== "admin") redirect("/dashboard");

  const items = await listContents();

  return (
    <div>
      <div><Link href="/admin">← Admin</Link></div>
      <h1 className="text-2xl font-semibold">Content</h1>
      <section>
        <h2>Upload</h2>
        <UploadForm />
      </section>
      <section>
        <h2>All content</h2>
        <ContentList items={items} />
      </section>
    </div>
  );
}
