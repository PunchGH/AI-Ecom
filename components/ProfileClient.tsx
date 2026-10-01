"use client";

import { useEffect, useState } from "react";
import { getProfile, updateProfile, type Profile } from "@/lib/profile";
import { supabase } from "@/lib/supabaseClient";
import TopNav from "./TopNav";
import FormField from "./FormField";
import AvatarUpload from "./AvatarUpload";

export default function ProfileClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email ?? "");
      const p = await getProfile();
      setProfile(p);
      setDisplayName(p?.display_name ?? "");
      setLoading(false);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({ display_name: displayName.trim() });
      setSaved(true);
    } catch (e: any) {
      setError(e.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  function onAvatarUploaded(url: string) {
    setProfile((p) => (p ? { ...p, avatar_url: url } : p));
  }

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="font-display text-2xl font-semibold">Profile</h1>

        {loading ? (
          <p className="mt-4 text-sm text-muted">Loading…</p>
        ) : (
          <div className="card mt-6 space-y-6 rounded-2xl border border-line bg-panel p-6">
            <AvatarUpload
              avatarUrl={profile?.avatar_url ?? null}
              displayName={displayName || email}
              onUploaded={onAvatarUploaded}
            />

            <form onSubmit={save} className="space-y-3">
              <FormField label="Display name" value={displayName} onChange={setDisplayName} />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">Email</span>
                <input
                  value={email}
                  disabled
                  className="w-full rounded-xl border border-line bg-panel2 px-3 py-2 text-sm text-muted"
                />
              </label>
              {error && <p className="text-sm text-down">{error}</p>}
              {saved && <p className="text-sm text-up">Saved.</p>}
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
