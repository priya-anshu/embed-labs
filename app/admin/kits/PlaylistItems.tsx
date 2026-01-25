"use client";

/**
 * Client component: Playlist item management.
 */

import { useState, useEffect } from "react";
import type { PlaylistItemRecord } from "@/features/qr/services/admin/playlists";
import type { ContentRecord } from "@/features/qr/services/admin/contents";

interface PlaylistItemsProps {
  playlistId: string;
  items: PlaylistItemRecord[];
  contents: ContentRecord[];
  onSuccess?: () => void;
}

export function PlaylistItems({ playlistId, items, contents, onSuccess }: PlaylistItemsProps) {
  const [selectedContentId, setSelectedContentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContentId) {
      setError("Select content");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/playlists/${playlistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: selectedContentId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed");
        setIsLoading(false);
        return;
      }
      setSelectedContentId("");
      setIsLoading(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setIsLoading(false);
    }
  };

  const handleRemove = async (contentId: string) => {
    if (!confirm("Remove from playlist?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/playlists/${playlistId}/items?contentId=${contentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setIsLoading(false);
    }
  };

  const handleReorder = async (orderedIds: string[]) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/playlists/${playlistId}/items/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedContentIds: orderedIds }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setIsLoading(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const ordered = items.map((i) => i.contentId);
    [ordered[index - 1], ordered[index]] = [ordered[index], ordered[index - 1]];
    handleReorder(ordered);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const ordered = items.map((i) => i.contentId);
    [ordered[index], ordered[index + 1]] = [ordered[index + 1], ordered[index]];
    handleReorder(ordered);
  };

  const availableContents = contents.filter((c) => !items.some((i) => i.contentId === c.id));

  return (
    <div>
      <h3>Items ({items.length})</h3>
      {items.length === 0 ? (
        <p>No items.</p>
      ) : (
        <ul>
          {items.map((item, idx) => {
            const content = contents.find((c) => c.id === item.contentId);
            return (
              <li key={item.id}>
                {idx + 1}. {content ? (content.title || content.filename || content.id) : item.contentId}
                <button type="button" onClick={() => moveUp(idx)} disabled={isLoading || idx === 0}>↑</button>
                <button type="button" onClick={() => moveDown(idx)} disabled={isLoading || idx === items.length - 1}>↓</button>
                <button type="button" onClick={() => handleRemove(item.contentId)} disabled={isLoading}>Remove</button>
              </li>
            );
          })}
        </ul>
      )}
      <form onSubmit={handleAdd}>
        <div>
          <label>
            Add content:{" "}
            <select value={selectedContentId} onChange={(e) => setSelectedContentId(e.target.value)} disabled={isLoading || availableContents.length === 0}>
              <option value="">— select —</option>
              {availableContents.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.contentType}: {c.title || c.filename || c.id}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={isLoading || !selectedContentId}>Add</button>
      </form>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
