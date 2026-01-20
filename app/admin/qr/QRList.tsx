"use client";

/**
 * Client component: QR list with revoke actions.
 * 
 * Handles data refresh after mutations.
 */

import { useRouter } from "next/navigation";
import { RevokeQRButton } from "./RevokeQRButton";
import type { QRCode } from "@/features/qr/types";

interface QRListProps {
  qrCodes: QRCode[];
}

export function QRList({ qrCodes }: QRListProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  if (qrCodes.length === 0) {
    return <p>No QR codes found.</p>;
  }

  return (
    <ul>
      {qrCodes.map((qr) => (
        <li key={qr.id}>
          <div>
            <p>ID: {qr.id}</p>
            <p>Code: {qr.code}</p>
            <p>Status: {qr.isActive ? "Active" : "Revoked"}</p>
            <p>Bound to: {qr.boundByUserId || "Unbound"}</p>
            <p>Created: {qr.createdAt.toLocaleString()}</p>
            {qr.boundAt && <p>Bound: {qr.boundAt.toLocaleString()}</p>}
            {qr.revokedAt && <p>Revoked: {qr.revokedAt.toLocaleString()}</p>}
            {qr.boundByUserId && (
              <RevokeQRButton
                qrId={qr.id}
                qrCode={qr.code}
                isActive={qr.isActive}
                onSuccess={handleRefresh}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
