import { Header } from "@/components/layout/header";
import { LeadsClient } from "@/components/leads/leads-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leads / CRM" };

export default function LeadsPage() {
  return (
    <div>
      <Header title="Leads / CRM" subtitle="Manage and convert your Facebook leads" />
      <div className="p-6">
        <LeadsClient />
      </div>
    </div>
  );
}
