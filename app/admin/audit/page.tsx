/**
 * Admin audit log page (skeleton).
 *
 * Placeholder for audit log UI. Read-only view of QR events.
 */

import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/features/auth";
import { getAllQREvents } from "@/features/qr/services/read";

export default async function AdminAuditPage() {
  const role = await getCurrentUserRole();

  if (role !== "admin") {
    redirect("/dashboard");
  }

  const events = await getAllQREvents();

  return (
    <main>
      <h1 className="text-2xl font-semibold">Audit Log</h1>
      <section>
        <h2>QR Events</h2>
        {events.length > 0 ? (
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                <div>
                  <p>Action: {event.action}</p>
                  <p>QR ID: {event.qrId}</p>
                  <p>Affected User: {event.affectedUserId || "N/A"}</p>
                  <p>Admin: {event.adminId || "N/A"}</p>
                  <p>Time: {event.createdAt.toLocaleString()}</p>
                  {event.details && (
                    <p>Details: {JSON.stringify(event.details)}</p>
                  )}
                </div>
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
