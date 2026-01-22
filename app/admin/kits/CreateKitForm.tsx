"use client";

/**
 * Client component: Create kit form.
 * 
 * SECURITY: Calls guarded admin API route only.
 * Explicit error handling, no silent failures.
 */

import { useState } from "react";

interface CreateKitFormProps {
  onSuccess?: () => void;
}

export function CreateKitForm({ onSuccess }: CreateKitFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/kits/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage =
          data.error === "INVALID_REQUEST"
            ? "Invalid input - name is required"
            : data.error === "UNAUTHORIZED"
            ? "Unauthorized - please log in"
            : data.error === "FORBIDDEN"
            ? "Forbidden - admin access required"
            : data.error === "SERVICE_CONFIGURATION_ERROR"
            ? `Service configuration error: ${data.message || "Unknown"}`
            : `Failed to create kit: ${data.error || "Unknown error"}`;

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setName("");
      setDescription("");
      setIsLoading(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "Failed to create kit"
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </label>
      </div>
      <div>
        <label>
          Description (optional):
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </label>
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Kit"}
      </button>
      {error && <p>Error: {error}</p>}
      {success && <p>Kit created successfully!</p>}
    </form>
  );
}
