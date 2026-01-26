"use client";

/**
 * Client component: Play content using token-gated delivery.
 *
 * Flow:
 * 1. Mint token for kit
 * 2. Fetch content via /api/content/[contentType]/[contentId]?token=...
 * 3. Render based on content type
 */

import { useState, useEffect } from "react";
import { mintTokenForKitAction } from "@/features/qr/actions";
import Image from "next/image";
interface ContentPlayerProps {
  contentId: string;
  contentType: string;
  kitId: string;
  title?: string | null;
}

export function ContentPlayer({
  contentId,
  contentType,
  kitId,
  title,
}: ContentPlayerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlay = async () => {
    setIsLoading(true);
    setError(null);
    setSignedUrl(null);

    try {
      // Step 1: Mint token for this kit
      const tokenResult = await mintTokenForKitAction(kitId);

      if (!tokenResult.success || !tokenResult.token) {
        const errorMsg =
          tokenResult.error === "UNAUTHORIZED"
            ? "Unauthorized"
            : tokenResult.error === "NO_ACTIVE_QR"
            ? "No active QR"
            : tokenResult.error === "NO_ACTIVE_GRANT"
            ? "No access to this kit"
            : tokenResult.error || "Failed to get access";
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      // Step 2: Fetch content with token
      const contentUrl = `/api/content/${contentType.toLowerCase()}/${contentId}?token=${encodeURIComponent(tokenResult.token)}`;
      const res = await fetch(contentUrl);
      const data = await res.json();

      if (!res.ok || !data.success || !data.signedUrl) {
        const errorMsg =
          data.error === "TOKEN_REQUIRED"
            ? "Token required"
            : data.error === "INVALID_TOKEN" || data.error === "TOKEN_CONSUMPTION_FAILED"
            ? "Token invalid or expired"
            : data.error === "ACCESS_DENIED"
            ? "Access denied"
            : data.error || "Failed to load content";
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      setSignedUrl(data.signedUrl);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-start playback when component mounts (once)
    handlePlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (signedUrl) {
    // Render content based on type
    if (contentType === "VIDEO") {
      return (
        <div>
          <video controls src={signedUrl} style={{ maxWidth: "100%" }}>
            Your browser does not support video playback.
          </video>
        </div>
      );
    } else if (contentType === "IMAGE") {
      return (
        <div>
          <Image src={signedUrl} alt={title || "Content"} width={500} height={500} style={{ maxWidth: "100%" }} />
        </div>
      );
    } else {
      // FILE or other
      return (
        <div>
          <a href={signedUrl} download>
            Download {title || "File"}
          </a>
        </div>
      );
    }
  }

  return (
    <div>
      <button type="button" onClick={handlePlay} disabled={isLoading}>
        {isLoading ? "Loading..." : "View / Play"}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
