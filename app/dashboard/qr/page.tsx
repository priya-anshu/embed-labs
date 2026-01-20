/**
 * User QR view page (skeleton).
 *
 * Placeholder for user's QR code view. Read-only.
 */

import { getUserQR } from "@/features/qr/services/read";

export default async function DashboardQRPage() {
  const qrCode = await getUserQR();

  return (
    <main>
      <h1>My QR Code</h1>
      {qrCode ? (
        <section>
          <h2>QR Code Details</h2>
          <div>
            <p>ID: {qrCode.id}</p>
            <p>Code: {qrCode.code}</p>
            <p>Status: {qrCode.isActive ? "Active" : "Revoked"}</p>
            <p>Created: {qrCode.createdAt.toLocaleString()}</p>
            <p>Bound: {qrCode.boundAt ? qrCode.boundAt.toLocaleString() : "Not bound"}</p>
            {qrCode.revokedAt && (
              <p>Revoked: {qrCode.revokedAt.toLocaleString()}</p>
            )}
            {qrCode.metadata && (
              <p>Metadata: {JSON.stringify(qrCode.metadata)}</p>
            )}
          </div>
        </section>
      ) : (
        <p>No QR code assigned.</p>
      )}
    </main>
  );
}
