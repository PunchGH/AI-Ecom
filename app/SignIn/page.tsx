import { Suspense } from "react";
import SignInClient from "@/components/SignInClient";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading…</div>}>
      <SignInClient />
    </Suspense>
  );
}
