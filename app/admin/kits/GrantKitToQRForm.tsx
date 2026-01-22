"use client";

/**
 * Client component: Grant kit to QR form.
 * 
 * SECURITY: Calls guarded admin API route only.
 * Explicit error handling, no silent failures.
 */

import { useState } from "react";

interface GrantKitToQRFormProps {
  kitId?: string;
  qrId?: string;
  onSuccess?: () => void;
}

export function GrantKitToQRForm({
  kitId: initialKitId,
  qrId: initialQrId,
  onSuccess,
}: GrantKitToQRFormProps) {
  const [kitId, setKitId] = useState(initialKitId || "");
  const [qrId, setQrId] = useState(initialQrId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/kits/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kitId: kitId.trim(),
          qrId: qrId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage =
          data.error === "INVALID_REQUEST"
            ? "Invalid input - both kit ID and QR ID are required"
            : data.error === "UNAUTHORIZED"
            ? "Unauthorized - please log in"
            : data.error === "FORBIDDEN"
            ? "Forbidden - admin access required"
            : data.error === "SERVICE_CONFIGURATION_ERROR"
            ? `Service configuration error: ${data.message || "Unknown"}`
            : `Failed to grant kit: ${data.error || "Unknown error"}`;

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      if (!initialKitId) setKitId("");
      if (!initialQrId) setQrId("");
      setIsLoading(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "Failed to grant kit"
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Kit ID:
          <input
            type="text"
            value={kitId}
            onChange={(e) => setKitId(e.target.value)}
            required
            disabled={isLoading || !!initialKitId}
          />
        </label>
      </div>
      <div>
        <label>
          QR ID:
          <input
            type="text"
            value={qrId}
            onChange={(e) => setQrId(e.target.value)}
            required
            disabled={isLoading || !!initialQrId}
          />
        </label>
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Granting..." : "Grant Kit to QR"}
      </button>
      {error && <p>Error: {error}</p>}
      {success && <p>Kit granted successfully!</p>}
    </form>
  );
}
