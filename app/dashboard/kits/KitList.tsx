"use client";

/**
 * Client component: List of kits available to the user.
 */

import type { Kit } from "@/features/qr/types";

interface KitListProps {
  kits: Kit[];
}

export function KitList({ kits }: KitListProps) {
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
        {kits.map((kit) => (
          <li key={kit.id}>
            <strong>{kit.name}</strong>
            {kit.description && <p>{kit.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
