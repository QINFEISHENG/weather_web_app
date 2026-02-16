import { Suspense } from "react";
import ReportClient from "./report-client";

export default function ReportPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading report…</div>}>
      <ReportClient />
    </Suspense>
  );
}