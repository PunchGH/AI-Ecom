"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthShell from "./AuthShell";
import FormField from "./FormField";

export default function ResetPasswordClient() {
  const router = useRouter();
  const params = useSearchParams();
  const recoveryMode = params.get("recovery") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function requestLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  async function setNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/SignIn?message=Password updated — sign in with your new password.");
  }

  if (recoveryMode) {
    return (
      <AuthShell title="Set a new password" subtitle="Choose something you'll remember.">
        <form onSubmit={setNewPassword} className="space-y-3">
          <FormField
            label="New password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={6}
            required
          />
          {error && <p className="text-sm text-down">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save new password"}
          </button>
        </form>
      </AuthShell>
    );
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle="Link on the way.">
        <p className="text-sm text-ink/85">
          If an account exists for <span className="text-ink">{email}</span>, a
          password reset link has been sent.
        </p>
        <Link
          href="/SignIn"
          className="mt-5 block w-full rounded-xl border border-line bg-panel2 py-2.5 text-center text-sm font-medium text-ink/85 transition hover:border-accent/50"
        >
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset password" subtitle="We'll email you a link.">
      <form onSubmit={requestLink} className="space-y-3">
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        {error && <p className="text-sm text-down">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link href="/SignIn" className="text-muted hover:text-ink">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
