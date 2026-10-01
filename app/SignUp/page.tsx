import { Suspense } from "react";
import SignUpClient from "@/components/SignUpClient";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading…</div>}>
      <SignUpClient />
    </Suspense>
  );
}
