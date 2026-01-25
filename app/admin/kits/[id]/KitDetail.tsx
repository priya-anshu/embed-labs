"use client";

/**
 * Client component: Kit detail view with items, grants, and actions.
 */

import { useState } from "react";
import Link from "next/link";
import { AddKitItemForm } from "../AddKitItemForm";
import { GrantKitToQRForm } from "../GrantKitToQRForm";
import { RevokeKitGrantButton } from "../RevokeKitGrantButton";
import { CreatePlaylistForm } from "../CreatePlaylistForm";
import { PlaylistList } from "../PlaylistList";
import type { Kit, KitItem, QRKitGrant, QRCode } from "@/features/qr/types";
import type { PlaylistRecord, PlaylistItemRecord } from "@/features/qr/services/admin/playlists";
import type { ContentRecord } from "@/features/qr/services/admin/contents";

interface KitDetailProps {
  kit: Kit;
  items: KitItem[];
  grants: QRKitGrant[];
  qrs: QRCode[];
  playlists: PlaylistRecord[];
  playlistItemsMap: Record<string, PlaylistItemRecord[]>;
  contents: ContentRecord[];
}

export function KitDetail({ kit, items, grants, qrs, playlists, playlistItemsMap, contents }: KitDetailProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1);
    window.location.reload();
  };

  const activeGrants = grants.filter((g) => !g.revokedAt);

  return (
    <div>
      <div>
        <Link href="/admin/kits">← Back to Kits</Link>
      </div>
      <h1>Kit: {kit.name}</h1>
      {kit.description && <p>{kit.description}</p>}
      <p>
        Status: {kit.isActive ? "Active" : "Disabled"} | Created:{" "}
        {kit.createdAt.toLocaleDateString()}
      </p>

      <div>
        <h2>Kit Items</h2>
        {items.length === 0 ? (
          <p>No items in this kit.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                {item.contentType}: {item.contentId}
              </li>
            ))}
          </ul>
        )}
        <AddKitItemForm key={refreshKey} kitId={kit.id} onSuccess={handleSuccess} />
      </div>

      <div>
        <h2>Playlists</h2>
        <CreatePlaylistForm key={refreshKey} kitId={kit.id} onSuccess={handleSuccess} />
        <PlaylistList
          playlists={playlists}
          playlistItemsMap={playlistItemsMap}
          contents={contents}
          onSuccess={handleSuccess}
        />
      </div>

      <div>
        <h2>Grant Kit to QR</h2>
        <GrantKitToQRForm
          key={refreshKey}
          kitId={kit.id}
          onSuccess={handleSuccess}
        />
      </div>

      <div>
        <h2>Active Grants ({activeGrants.length})</h2>
        {activeGrants.length === 0 ? (
          <p>No active grants for this kit.</p>
        ) : (
          <ul>
            {activeGrants.map((grant) => {
              const qr = qrs.find((q) => q.id === grant.qrId);
              return (
                <li key={grant.id}>
                  QR: {qr ? qr.code : grant.qrId} | Granted:{" "}
                  {grant.grantedAt.toLocaleDateString()}
                  <RevokeKitGrantButton
                    grantId={grant.id}
                    onSuccess={handleSuccess}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
