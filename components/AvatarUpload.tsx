"use client";

import { useRef, useState } from "react";
import { uploadAvatar } from "@/lib/profile";

export default function AvatarUpload({
  avatarUrl,
  displayName,
  onUploaded,
}: {
  avatarUrl: string | null;
  displayName: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError(null);
    try {
      const url = await uploadAvatar(file);
      setPreview(url);
      onUploaded(url);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const initials = displayName.trim().slice(0, 2).toUpperCase() || "?";

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-line bg-panel2">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center font-display text-lg font-semibold text-muted">
            {initials}
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-line bg-panel2 px-3 py-1.5 text-sm text-ink/85 transition hover:border-accent/50 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Change avatar"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        {error && <p className="mt-1 text-xs text-down">{error}</p>}
      </div>
    </div>
  );
}
