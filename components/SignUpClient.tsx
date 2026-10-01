"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthShell from "./AuthShell";
import FormField from "./FormField";

export default function SignUpClient() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim() || undefined },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      // Email confirmation is off for this project — the user is signed in.
      router.push("/Dashboard");
      router.refresh();
    } else {
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <AuthShell title="Check your email" subtitle="Almost there.">
        <p className="text-sm text-ink/85">
          We sent a confirmation link to <span className="text-ink">{email}</span>.
          Click it to finish creating your account, then come back and sign in.
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
    <AuthShell title="Create account" subtitle="Start reading demand signals.">
      <form onSubmit={submit} className="space-y-3">
        <FormField
          label="Display name"
          value={displayName}
          onChange={setDisplayName}
          autoComplete="name"
          placeholder="Optional"
        />
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <FormField
          label="Password"
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        <span className="text-muted">Already have an account? </span>
        <Link href="/SignIn" className="text-accent hover:brightness-110">
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}
