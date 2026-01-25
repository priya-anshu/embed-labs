"use client";

/**
 * Client component: Playlist list with actions.
 */

import { useState } from "react";
import type { PlaylistRecord } from "@/features/qr/services/admin/playlists";
import { PlaylistItems } from "./PlaylistItems";
import type { PlaylistItemRecord } from "@/features/qr/services/admin/playlists";
import type { ContentRecord } from "@/features/qr/services/admin/contents";

interface PlaylistListProps {
  playlists: PlaylistRecord[];
  playlistItemsMap: Record<string, PlaylistItemRecord[]>;
  contents: ContentRecord[];
  onSuccess?: () => void;
}

export function PlaylistList({ playlists, playlistItemsMap, contents, onSuccess }: PlaylistListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (playlistId: string) => {
    if (!confirm("Delete playlist?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/playlists/${playlistId}`, { method: "DELETE" });
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

  const handleRename = async (playlistId: string) => {
    if (!editName.trim()) {
      setError("Name required");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/playlists/${playlistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed");
        setIsLoading(false);
        return;
      }
      setEditingId(null);
      setEditName("");
      setIsLoading(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setIsLoading(false);
    }
  };

  if (playlists.length === 0) {
    return <p>No playlists.</p>;
  }

  return (
    <div>
      {playlists.map((playlist) => (
        <div key={playlist.id}>
          <h3>
            {editingId === playlist.id ? (
              <>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={isLoading} />
                <button type="button" onClick={() => handleRename(playlist.id)} disabled={isLoading}>Save</button>
                <button type="button" onClick={() => { setEditingId(null); setEditName(""); }} disabled={isLoading}>Cancel</button>
              </>
            ) : (
              <>
                {playlist.name} {playlist.description && `(${playlist.description})`}
                <button type="button" onClick={() => { setEditingId(playlist.id); setEditName(playlist.name); }} disabled={isLoading}>Rename</button>
                <button type="button" onClick={() => handleDelete(playlist.id)} disabled={isLoading}>Delete</button>
              </>
            )}
          </h3>
          <PlaylistItems
            playlistId={playlist.id}
            items={playlistItemsMap[playlist.id] || []}
            contents={contents}
            onSuccess={onSuccess}
          />
        </div>
      ))}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
