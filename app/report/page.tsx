import { Suspense } from "react";
import ReportClient from "./report-client";

// must wrap this in suspense, so that it can work in the vercel 
export default function ReportPage() {
  return (
    <Suspense fallback={<div style={{padding:24 }}>Loading The Report, wait a little bit </div>}>
      <ReportClient />
    </Suspense>
  );
}