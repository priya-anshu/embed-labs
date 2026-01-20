/**
 * Admin dashboard shell.
 *
 * Minimal, unstyled placeholder. Access should be restricted
 * to admin role via server-side checks and routing.
 */

import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/features/auth";
import { getAllQRs, getAllQREvents } from "@/features/qr/services/read";

export default async function AdminPage() {
  const role = await getCurrentUserRole();

  if (role !== "admin") {
    redirect("/dashboard");
  }

  const qrCodes = await getAllQRs();
  const events = await getAllQREvents();

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <section>
        <h2>QR Codes Overview</h2>
        <p>Total QR Codes: {qrCodes.length}</p>
        <p>Active: {qrCodes.filter((qr) => qr.isActive).length}</p>
        <p>Revoked: {qrCodes.filter((qr) => !qr.isActive).length}</p>
        <p>Bound: {qrCodes.filter((qr) => qr.boundByUserId).length}</p>
      </section>
      <section>
        <h2>Recent Events</h2>
        {events.length > 0 ? (
          <ul>
            {events.slice(0, 10).map((event) => (
              <li key={event.id}>
                {event.action} - QR: {event.qrId} - {event.createdAt.toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No events found.</p>
        )}
      </section>
    </main>
  );
}

