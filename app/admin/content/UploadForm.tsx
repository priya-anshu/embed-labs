"use client";

/**
 * Client: Upload content to Cloudinary and persist to contents.
 * On success triggers router.refresh() to reload the content list.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Choose a file");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const form = new FormData();
      form.set("file", file);
      if (title.trim()) form.set("title", title.trim());

      const res = await fetch("/api/admin/content/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || data.error || "Upload failed");
        setIsLoading(false);
        return;
      }
      setSuccess(true);
      setFile(null);
      setTitle("");
      setIsLoading(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          File: <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} disabled={isLoading} required />
        </label>
      </div>
      <div>
        <label>
          Title (optional): <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isLoading} />
        </label>
      </div>
      <button type="submit" disabled={isLoading}>{isLoading ? "Uploading..." : "Upload"}</button>
      {error && <p>Error: {error}</p>}
      {success && <p>Uploaded.</p>}
    </form>
  );
}
