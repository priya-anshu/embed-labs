/**
 * Admin QR management page.
 *
 * Server component: fetches read-only data.
 * Client components handle mutations.
 */

import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/features/auth";
import { getAllQRs } from "@/features/qr/services/read";
import { QRList } from "./QRList";
import { ReassignQRForm } from "./ReassignQRForm";

export default async function AdminQRPage() {
  const role = await getCurrentUserRole();

  if (role !== "admin") {
    redirect("/dashboard");
  }

  const qrCodes = await getAllQRs();

  return (
    <main>
      <h1>QR Management</h1>
      <section>
        <h2>QR Codes</h2>
        <QRList qrCodes={qrCodes} />
      </section>
      <section>
        <h2>Reassign QR</h2>
        <ReassignQRForm />
      </section>
    </main>
  );
}
