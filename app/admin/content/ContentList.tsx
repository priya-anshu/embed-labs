/**
 * List of content records (metadata only).
 */

import type { ContentRecord } from "@/features/qr/services/admin/contents";

interface ContentListProps {
  items: ContentRecord[];
}

export function ContentList({ items }: ContentListProps) {
  if (items.length === 0) {
    return <p>No content. Upload a file above.</p>;
  }
  return (
    <ul>
      {items.map((c) => (
        <li key={c.id}>
          {c.contentType}: {c.title || c.filename || c.id} — {c.id}
        </li>
      ))}
    </ul>
  );
}
