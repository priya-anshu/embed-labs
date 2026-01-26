"use client";

/**
 * Client component: Button to mint access token.
 * Flow:
 * 1. User clicks "Mint Access Token"
 * 2. Calls mintTokenAction server action
 * SECURITY: Calls server action only.
 * Explicit error handling, no silent failures.
 */

import { useState } from "react";
import { mintTokenAction } from "@/features/qr/actions";

export function MintTokenButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const handleMint = async () => {
    setIsLoading(true);
    setError(null);
    setToken(null);
    setExpiresAt(null);

    try {
      const result = await mintTokenAction();

      if (!result.success) {
        const errorMessage =
          result.error === "UNAUTHORIZED"
            ? "Unauthorized - please log in"
            : result.error === "NO_ACTIVE_QR"
            ? "No active QR code found. Contact an administrator."
            : result.error === "NO_ACTIVE_GRANT"
            ? "No active kit grants found. Contact an administrator."
            : result.error === "SERVICE_CONFIGURATION_ERROR"
            ? "Service configuration error. Please try again later."
            : `Failed to mint token: ${result.error || "Unknown error"}`;

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      setToken(result.token || null);
      setExpiresAt(result.expiresAt || null);
      setIsLoading(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "Failed to mint token"
      );
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleMint} disabled={isLoading}>
        {isLoading ? "Minting..." : "Mint Access Token"}
      </button>
      {error && <p>Error: {error}</p>}
      {token && (
        <div>
          <p>
            <strong>Access Token (copy this - it will not be shown again):</strong>
          </p>
          <pre>{token}</pre>
          {expiresAt && (
            <p>Expires at: {expiresAt.toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
}
