import { Suspense } from "react";
import HistoryClient from "@/components/HistoryClient";

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading…</div>}>
      <HistoryClient />
    </Suspense>
  );
}
