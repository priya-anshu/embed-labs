"use client";

/**
 * Client component: Revoke QR button with confirmation.
 * 
 * SECURITY: Calls guarded admin API route only.
 * Explicit error handling, no silent failures.
 */

import { useState } from "react";

interface RevokeQRButtonProps {
  qrId: string;
  qrCode: string;
  isActive: boolean;
  onSuccess: () => void;
}

export function RevokeQRButton({
  qrId,
  qrCode,
  isActive,
  onSuccess,
}: RevokeQRButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/revoke-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage =
          data.error === "NOT_FOUND"
            ? "QR code not found"
            : data.error === "ALREADY_REVOKED"
            ? "QR code is already revoked"
            : data.error === "NOT_BOUND"
            ? "QR code is not bound to any user"
            : data.error === "SERVICE_CONFIGURATION_ERROR"
            ? `Service configuration error: ${data.message || "Unknown"}`
            : data.error === "UNAUTHORIZED"
            ? "Unauthorized - please log in"
            : data.error === "FORBIDDEN"
            ? "Forbidden - admin access required"
            : `Failed to revoke QR: ${data.error || "Unknown error"}`;

        setError(errorMessage);
        setIsLoading(false);
        setIsConfirming(false);
        return;
      }

      // Success - refresh data
      setIsConfirming(false);
      setIsLoading(false);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "Failed to revoke QR code"
      );
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  if (!isActive) {
    return <span>Already revoked</span>;
  }

  if (isConfirming) {
    return (
      <div>
        <p>Confirm revoke QR: {qrCode}?</p>
        <button onClick={handleRevoke} disabled={isLoading}>
          {isLoading ? "Revoking..." : "Confirm Revoke"}
        </button>
        <button
          onClick={() => {
            setIsConfirming(false);
            setError(null);
          }}
          disabled={isLoading}
        >
          Cancel
        </button>
        {error && <p>Error: {error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsConfirming(true)}
        disabled={isLoading}
      >
        Revoke QR
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
