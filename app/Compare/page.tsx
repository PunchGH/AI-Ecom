import { Suspense } from "react";
import CompareClient from "@/components/CompareClient";

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading…</div>}>
      <CompareClient />
    </Suspense>
  );
}
