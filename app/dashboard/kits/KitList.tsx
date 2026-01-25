"use client";

/**
 * Client component: List of kits available to the user with playlists.
 */

import { useState, useEffect } from "react";
import type { Kit } from "@/features/qr/types";
import type { PlaylistRecord, PlaylistItemRecord } from "@/features/qr/services/admin/playlists";
import type { ContentRecord } from "@/features/qr/services/admin/contents";

interface KitListProps {
  kits: Kit[];
}

export function KitList({ kits }: KitListProps) {
  const [playlistsMap, setPlaylistsMap] = useState<Record<string, PlaylistRecord[]>>({});
  const [itemsMap, setItemsMap] = useState<Record<string, PlaylistItemRecord[]>>({});
  const [contentsMap, setContentsMap] = useState<Record<string, ContentRecord>>({});
  const [expandedKits, setExpandedKits] = useState<Set<string>>(new Set());

  const loadContentTitles = async (contentIds: string[]) => {
    if (contentIds.length === 0) return;
    const missing = contentIds.filter((id) => !contentsMap[id]);
    if (missing.length === 0) return;

    try {
      const res = await fetch("/api/content/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentIds: missing }),
      });
      const data = await res.json();
      if (data.success && data.contents) {
        setContentsMap((prev) => {
          const next = { ...prev };
          data.contents.forEach((c: { id: string; title: string | null; filename: string | null; contentType: string }) => {
            next[c.id] = {
              id: c.id,
              contentType: c.contentType,
              title: c.title ?? null,
              filename: c.filename ?? null,
              description: null,
              mimeType: null,
              bytes: null,
              createdAt: new Date(),
              uploadedBy: null,
            };
          });
          return next;
        });
      }
    } catch {
      // Ignore errors
    }
  };

  const loadPlaylists = async (kitId: string) => {
    if (playlistsMap[kitId]) return; // Already loaded

    try {
      const res = await fetch(`/api/kits/${kitId}/playlists`);
      const data = await res.json();
      if (data.success && data.playlists) {
        setPlaylistsMap((prev) => ({ ...prev, [kitId]: data.playlists }));

        // Load items for each playlist
        const allContentIds: string[] = [];
        for (const playlist of data.playlists) {
          const itemsRes = await fetch(`/api/playlists/${playlist.id}/items`);
          const itemsData = await itemsRes.json();
          if (itemsData.success && itemsData.items) {
            setItemsMap((prev) => ({ ...prev, [playlist.id]: itemsData.items }));
            itemsData.items.forEach((item: PlaylistItemRecord) => {
              allContentIds.push(item.contentId);
            });
          }
        }
        // Load content titles for all items
        if (allContentIds.length > 0) {
          loadContentTitles(allContentIds);
        }
      }
    } catch {
      // Ignore errors
    }
  };

  const toggleKit = (kitId: string) => {
    if (expandedKits.has(kitId)) {
      setExpandedKits((prev) => {
        const next = new Set(prev);
        next.delete(kitId);
        return next;
      });
    } else {
      setExpandedKits((prev) => new Set(prev).add(kitId));
      loadPlaylists(kitId);
    }
  };

  if (kits.length === 0) {
    return (
      <div>
        <p>No kits available. Contact an administrator to grant access.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Your Kits ({kits.length})</h3>
      <ul>
        {kits.map((kit) => {
          const isExpanded = expandedKits.has(kit.id);
          const playlists = playlistsMap[kit.id] || [];

          return (
            <li key={kit.id}>
              <div>
                <strong>{kit.name}</strong>
                {kit.description && <p>{kit.description}</p>}
                <button type="button" onClick={() => toggleKit(kit.id)}>
                  {isExpanded ? "Hide" : "Show"} Playlists
                </button>
              </div>
              {isExpanded && (
                <div>
                  {playlists.length === 0 ? (
                    <p>No playlists.</p>
                  ) : (
                    <ul>
                      {playlists.map((playlist) => {
                        const items = itemsMap[playlist.id] || [];
                        return (
                          <li key={playlist.id}>
                            <strong>{playlist.name}</strong>
                            {playlist.description && <p>{playlist.description}</p>}
                            {items.length === 0 ? (
                              <p>No items.</p>
                            ) : (
                              <ol>
                                {items.map((item) => {
                                  const content = contentsMap[item.contentId];
                                  return (
                                    <li key={item.id}>
                                      {content
                                        ? content.title || content.filename || content.id
                                        : item.contentId}
                                    </li>
                                  );
                                })}
                              </ol>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
