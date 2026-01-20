"use client";

/**
 * Client component: Reassign QR form.
 * 
 * SECURITY: Calls guarded admin API route only.
 * Explicit error handling, no silent failures.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ReassignQRFormProps {
  userId?: string;
  oldQRId?: string;
  onSuccess?: () => void;
}

export function ReassignQRForm({
  userId: initialUserId,
  oldQRId: initialOldQRId,
  onSuccess,
}: ReassignQRFormProps) {
  const router = useRouter();
  const [userId, setUserId] = useState(initialUserId || "");
  const [oldQRId, setOldQRId] = useState(initialOldQRId || "");
  const [revokeOldQR, setRevokeOldQR] = useState(false);
  const [metadata, setMetadata] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!userId.trim()) {
      setError("User ID is required");
      setIsLoading(false);
      return;
    }

    try {
      const body: {
        userId: string;
        revokeOldQR?: boolean;
        oldQRId?: string;
        metadata?: unknown;
      } = {
        userId: userId.trim(),
      };

      if (revokeOldQR && oldQRId.trim()) {
        body.revokeOldQR = true;
        body.oldQRId = oldQRId.trim();
      }

      if (metadata.trim()) {
        try {
          body.metadata = JSON.parse(metadata.trim());
        } catch {
          setError("Invalid JSON in metadata field");
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch("/api/admin/reassign-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage =
          data.error === "USER_NOT_FOUND"
            ? "User not found"
            : data.error === "INVALID_METADATA"
            ? "Invalid metadata format"
            : data.error === "SERVICE_CONFIGURATION_ERROR"
            ? `Service configuration error: ${data.message || "Unknown"}`
            : data.error === "UNAUTHORIZED"
            ? "Unauthorized - please log in"
            : data.error === "FORBIDDEN"
            ? "Forbidden - admin access required"
            : data.error === "INVALID_REQUEST"
            ? "Invalid request - check your input"
            : `Failed to reassign QR: ${data.error || "Unknown error"}`;

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Success
      setSuccess(
        data.newQRId
          ? `QR reassigned successfully. New QR ID: ${data.newQRId}`
          : "QR reassigned successfully"
      );
      setIsLoading(false);
      
      // Reset form
      setUserId("");
      setOldQRId("");
      setRevokeOldQR(false);
      setMetadata("");
      
      // Refresh data after a short delay
      setTimeout(() => {
        router.refresh();
        if (onSuccess) {
          onSuccess();
        }
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "Failed to reassign QR code"
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          User ID (required):
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={isLoading}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Old QR ID (optional, if revoking old QR):
          <input
            type="text"
            value={oldQRId}
            onChange={(e) => setOldQRId(e.target.value)}
            disabled={isLoading}
          />
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={revokeOldQR}
            onChange={(e) => setRevokeOldQR(e.target.checked)}
            disabled={isLoading}
          />
          Revoke old QR
        </label>
      </div>
      <div>
        <label>
          Metadata (optional, JSON format):
          <textarea
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            disabled={isLoading}
            placeholder='{"course_id": "123"}'
          />
        </label>
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Reassigning..." : "Reassign QR"}
      </button>
      {error && <p>Error: {error}</p>}
      {success && <p>{success}</p>}
    </form>
  );
}
