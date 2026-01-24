"use client";

/**
 * Client component: Add kit item form.
 *
 * Picks from content library (GET /api/admin/content) and attaches to kit
 * via POST /api/admin/kits/add-item.
 */

import { useState, useEffect } from "react";
import Link from "next/link";

interface ContentItem {
  id: string;
  contentType: string;
  title: string | null;
  filename: string | null;
}

interface AddKitItemFormProps {
  kitId: string;
  onSuccess?: () => void;
}

export function AddKitItemForm({ kitId, onSuccess }: AddKitItemFormProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => (d.success && d.items ? setItems(d.items) : setItems([])))
      .catch(() => setItems([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setError("Select content");
      return;
    }
    const c = items.find((i) => i.id === selectedId);
    if (!c) {
      setError("Selected content not found");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/kits/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitId,
          contentType: c.contentType,
          contentId: c.id,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg =
          data.error === "INVALID_REQUEST" ? "Invalid input" :
          data.error === "UNAUTHORIZED" ? "Unauthorized" :
          data.error === "FORBIDDEN" ? "Forbidden" :
          data.error === "SERVICE_CONFIGURATION_ERROR" ? "Config error" :
          data.error || "Failed to add";
        setError(msg);
        setIsLoading(false);
        return;
      }
      setSuccess(true);
      setSelectedId("");
      setIsLoading(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <p>
        No content in library. <Link href="/admin/content">Upload content</Link> first.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Content:{" "}
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="">— select —</option>
            {items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contentType}: {c.title || c.filename || c.id}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add to kit"}
      </button>
      {error && <p>Error: {error}</p>}
      {success && <p>Added.</p>}
    </form>
  );
}
