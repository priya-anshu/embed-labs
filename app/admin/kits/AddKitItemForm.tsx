"use client";

/**
 * Client component: Add kit item form.
 * 
 * SECURITY: Calls guarded admin API route only.
 * Explicit error handling, no silent failures.
 */

import { useState } from "react";

interface AddKitItemFormProps {
  kitId: string;
  onSuccess?: () => void;
}

export function AddKitItemForm({ kitId, onSuccess }: AddKitItemFormProps) {
  const [contentType, setContentType] = useState("");
  const [contentId, setContentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/kits/add-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kitId,
          contentType: contentType.trim(),
          contentId: contentId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage =
          data.error === "INVALID_REQUEST"
            ? "Invalid input - all fields are required"
            : data.error === "UNAUTHORIZED"
            ? "Unauthorized - please log in"
            : data.error === "FORBIDDEN"
            ? "Forbidden - admin access required"
            : data.error === "SERVICE_CONFIGURATION_ERROR"
            ? `Service configuration error: ${data.message || "Unknown"}`
            : `Failed to add kit item: ${data.error || "Unknown error"}`;

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setContentType("");
      setContentId("");
      setIsLoading(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "Failed to add kit item"
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Content Type:
          <input
            type="text"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            placeholder="e.g., COURSE, LESSON, VIDEO, FILE"
            required
            disabled={isLoading}
          />
        </label>
      </div>
      <div>
        <label>
          Content ID:
          <input
            type="text"
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            placeholder="UUID of the content"
            required
            disabled={isLoading}
          />
        </label>
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Item"}
      </button>
      {error && <p>Error: {error}</p>}
      {success && <p>Item added successfully!</p>}
    </form>
  );
}
