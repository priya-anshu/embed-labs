/**
 * Admin page: Kit detail view.
 * 
 * SECURITY-FIRST:
 * - Server-side role check (admin only)
 * - Shows kit details, items, and grants
 */

import type { PlaylistItemRecord } from "@/features/qr/services/admin/playlists";
import { getCurrentUser } from "@/features/auth";
import { getCurrentUserRole } from "@/features/auth/services/role";
import {
  getKitById,
  getKitItems,
  getKitGrants,
  getAllQRs,
} from "@/features/qr/services/read";
import {
  getPlaylistsByKit,
  getPlaylistItems,
} from "@/features/qr/services/admin/playlists";
import { listContents } from "@/features/qr/services/admin/contents";
import { KitDetail } from "./KitDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminKitDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const role = await getCurrentUserRole();
  if (role !== "admin") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const kit = await getKitById(id);

  if (!kit) {
    notFound();
  }

  const [items, grants, qrs, playlists, contents] = await Promise.all([
    getKitItems(id),
    getKitGrants(id),
    getAllQRs(),
    getPlaylistsByKit(id),
    listContents(),
  ]);

  const playlistItemsMap: Record<string, PlaylistItemRecord[]> = {};
  for (const playlist of playlists) {
    playlistItemsMap[playlist.id] = await getPlaylistItems(playlist.id);
  }

  return (
    <KitDetail
      kit={kit}
      items={items}
      grants={grants}
      qrs={qrs}
      playlists={playlists}
      playlistItemsMap={playlistItemsMap}
      contents={contents}
    />
  );
}
