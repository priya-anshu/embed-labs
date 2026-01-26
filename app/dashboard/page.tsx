/**
 * User dashboard shell.
 *
 * Minimal, unstyled placeholder. Access is controlled by
 * middleware and root route redirects.
 */

import { getUserQR, getUserQREvents, getUserKits } from "@/features/qr/services/read";
import { KitList } from "./kits/KitList";
import { MintTokenButton } from "./kits/MintTokenButton";
import { getCurrentUser } from "@/features/auth/services/session";

export default async function DashboardPage() {
  const qrCode = await getUserQR();
  const events = await getUserQREvents();
  const kits = await getUserKits();
  const user = await getCurrentUser();
  console.log("API USER:", user?.id);
  console.log("QR CODE:", qrCode?.code);
  console.log("EVENTS:", events.length);
  console.log("KITS:", kits.length);

  return (
    <main>
      <h1>User Dashboard</h1>
      <section>
        <h2>QR Code Status</h2>
        {qrCode ? (
          <div>
            <p>QR Code: {qrCode.code}</p>
            <p>Status: {qrCode.isActive ? "Active" : "Revoked"}</p>
            <p>Bound: {qrCode.boundAt ? qrCode.boundAt.toLocaleString() : "Not bound"}</p>
          </div>
        ) : (
          <p>No QR code assigned.</p>
        )}
      </section>
      <section>
        <h2>Your Kits</h2>
        <KitList kits={kits} />
      </section>
      <section>
        <h2>Access Token</h2>
        <MintTokenButton />
      </section>
      <section>
        <h2>Recent Events</h2>
        {events.length > 0 ? (
          <ul>
            {events.slice(0, 5).map((event) => (
              <li key={event.id}>
                {event.action} - {event.createdAt.toLocaleString()}
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

