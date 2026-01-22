"use client";

/**
 * Client component: Disable kit button with confirmation.
 * 
 * SECURITY: Calls guarded admin API route only.
 * Explicit error handling, no silent failures.
 */

import { useState } from "react";

interface DisableKitButtonProps {
  kitId: string;
  kitName: string;
  isActive: boolean;
  onSuccess: () => void;
}

export function DisableKitButton({
  kitId,
  kitName,
  isActive,
  onSuccess,
}: DisableKitButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDisable = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/kits/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kitId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage =
          data.error === "NOT_FOUND"
            ? "Kit not found"
            : data.error === "INVALID_REQUEST"
            ? "Invalid request"
            : data.error === "UNAUTHORIZED"
            ? "Unauthorized - please log in"
            : data.error === "FORBIDDEN"
            ? "Forbidden - admin access required"
            : data.error === "SERVICE_CONFIGURATION_ERROR"
            ? `Service configuration error: ${data.message || "Unknown"}`
            : `Failed to disable kit: ${data.error || "Unknown error"}`;

        setError(errorMessage);
        setIsLoading(false);
        setIsConfirming(false);
        return;
      }

      setIsConfirming(false);
      setIsLoading(false);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "Failed to disable kit"
      );
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  if (!isActive) {
    return <span>Already disabled</span>;
  }

  if (isConfirming) {
    return (
      <div>
        <p>Confirm disable kit: {kitName}?</p>
        <button onClick={handleDisable} disabled={isLoading}>
          {isLoading ? "Disabling..." : "Confirm Disable"}
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
        Disable Kit
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
