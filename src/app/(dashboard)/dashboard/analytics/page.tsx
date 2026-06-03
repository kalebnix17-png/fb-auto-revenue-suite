import { Header } from "@/components/layout/header";
import { AnalyticsClient } from "@/components/analytics/analytics-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div>
      <Header title="Analytics" subtitle="Track your Facebook marketing performance" />
      <div className="p-6">
        <AnalyticsClient />
      </div>
    </div>
  );
}
