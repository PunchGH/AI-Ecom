import { Suspense } from "react";
import ResetPasswordClient from "@/components/ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading…</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
