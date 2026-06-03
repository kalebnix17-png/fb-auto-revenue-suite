import { Header } from "@/components/layout/header";
import { BillingClient } from "@/components/billing/billing-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing & Plans" };

export default function BillingPage() {
  return (
    <div>
      <Header title="Billing & Plans" subtitle="Manage your subscription and payment details" />
      <div className="p-6">
        <BillingClient />
      </div>
    </div>
  );
}
