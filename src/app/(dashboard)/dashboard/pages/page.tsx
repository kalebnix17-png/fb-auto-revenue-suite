import { Header } from "@/components/layout/header";
import { PagesClient } from "@/components/pages/pages-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Facebook Pages" };

export default function PagesPage() {
  return (
    <div>
      <Header title="Facebook Pages" subtitle="Connect and manage your Facebook Pages" />
      <div className="p-6">
        <PagesClient />
      </div>
    </div>
  );
}
