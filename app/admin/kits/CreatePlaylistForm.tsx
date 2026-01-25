"use client";

/**
 * Client component: Create playlist form.
 */

import { useState } from "react";

interface CreatePlaylistFormProps {
  kitId: string;
  onSuccess?: () => void;
}

export function CreatePlaylistForm({ kitId, onSuccess }: CreatePlaylistFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name required");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/kits/${kitId}/playlists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed");
        setIsLoading(false);
        return;
      }
      setSuccess(true);
      setName("");
      setDescription("");
      setIsLoading(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Name: <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} required />
        </label>
      </div>
      <div>
        <label>
          Description: <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} />
        </label>
      </div>
      <button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create Playlist"}</button>
      {error && <p>Error: {error}</p>}
      {success && <p>Created.</p>}
    </form>
  );
}
