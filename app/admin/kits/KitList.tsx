"use client";

/**
 * Client component: List of kits with disable actions.
 */

import Link from "next/link";
import { DisableKitButton } from "./DisableKitButton";
import type { Kit } from "@/features/qr/types";

interface KitListProps {
  kits: Kit[];
}

export function KitList({ kits }: KitListProps) {
  const handleSuccess = () => {
    window.location.reload();
  };

  if (kits.length === 0) {
    return <p>No kits found.</p>;
  }

  return (
    <div>
      {kits.map((kit) => (
        <div key={kit.id}>
          <div>
            <Link href={`/admin/kits/${kit.id}`}>
              <strong>{kit.name}</strong>
            </Link>
            {kit.description && <p>{kit.description}</p>}
            <p>
              Status: {kit.isActive ? "Active" : "Disabled"} | Created:{" "}
              {kit.createdAt.toLocaleDateString()}
            </p>
          </div>
          <DisableKitButton
            kitId={kit.id}
            kitName={kit.name}
            isActive={kit.isActive}
            onSuccess={handleSuccess}
          />
        </div>
      ))}
    </div>
  );
}
