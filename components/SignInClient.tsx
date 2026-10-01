"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthShell from "./AuthShell";
import FormField from "./FormField";

export default function SignInClient() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/Dashboard";
  const message = params.get("message");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  return (
    <AuthShell title="Sign in" subtitle="Read the demand signal on your products.">
      {message && (
        <p className="mb-4 rounded-lg border border-up/30 bg-up/10 px-3 py-2 text-sm text-up">
          {message}
        </p>
      )}
      <form onSubmit={submit} className="space-y-3">
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
          autoComplete="current-password"
          required
        />
        {error && <p className="text-sm text-down">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm">
        <Link href="/ResetPassword" className="text-muted hover:text-ink">
          Forgot password?
        </Link>
        <Link href="/SignUp" className="text-accent hover:brightness-110">
          Create account
        </Link>
      </div>
    </AuthShell>
  );
}
