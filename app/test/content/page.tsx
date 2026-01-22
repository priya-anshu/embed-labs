/**
 * Test page for content delivery flow.
 *
 * SECURITY: This is a test page only.
 * In production, content would be accessed via direct API calls.
 */

"use client";

import { useState } from "react";
import { mintTokenAction } from "@/features/qr/actions";

export default function ContentTestPage() {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [contentType, setContentType] = useState("VIDEO");
  const [contentId, setContentId] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentResult, setContentResult] = useState<any>(null);

  const handleMintToken = async () => {
    setIsMinting(true);
    setError(null);
    setToken(null);
    setExpiresAt(null);

    try {
      const result = await mintTokenAction();
      if (!result.success) {
        setError(`Failed to mint token: ${result.error}`);
        setIsMinting(false);
        return;
      }
      setToken(result.token || null);
      setExpiresAt(result.expiresAt || null);
      setIsMinting(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mint token"
      );
      setIsMinting(false);
    }
  };

  const handleRequestContent = async () => {
    if (!token || !contentType || !contentId) {
      setError("Token, content type, and content ID are required");
      return;
    }

    setIsRequesting(true);
    setError(null);
    setContentResult(null);

    try {
      const url = `/api/content/${contentType}/${contentId}?token=${encodeURIComponent(token)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError(`Content request failed: ${data.error || "Unknown error"}`);
        setIsRequesting(false);
        return;
      }

      setContentResult(data);
      setIsRequesting(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to request content"
      );
      setIsRequesting(false);
    }
  };

  return (
    <div>
      <h1>Content Delivery Test</h1>

      <section>
        <h2>Step 1: Mint Access Token</h2>
        <button onClick={handleMintToken} disabled={isMinting}>
          {isMinting ? "Minting..." : "Mint Token"}
        </button>
        {token && (
          <div>
            <p>
              <strong>Token:</strong> {token}
            </p>
            {expiresAt && (
              <p>
                <strong>Expires:</strong> {expiresAt.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </section>

      <section>
        <h2>Step 2: Request Content</h2>
        <div>
          <label>
            Content Type:
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="VIDEO">VIDEO</option>
              <option value="FILE">FILE</option>
              <option value="COURSE">COURSE</option>
              <option value="LESSON">LESSON</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Content ID (UUID):
            <input
              type="text"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              placeholder="Enter content UUID"
            />
          </label>
        </div>
        <button
          onClick={handleRequestContent}
          disabled={isRequesting || !token}
        >
          {isRequesting ? "Requesting..." : "Request Content"}
        </button>
        {contentResult && (
          <div>
            <p>
              <strong>Success!</strong>
            </p>
            <pre>{JSON.stringify(contentResult, null, 2)}</pre>
            {contentResult.signedUrl && (
              <div>
                <h3>Play Content</h3>
                {contentResult.contentType === "VIDEO" ? (
                  <video
                    controls
                    src={contentResult.signedUrl}
                    style={{ maxWidth: "100%", height: "auto" }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div>
                    <p>
                      <a
                        href={contentResult.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download/View File
                      </a>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {error && (
        <div>
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}
    </div>
  );
}
