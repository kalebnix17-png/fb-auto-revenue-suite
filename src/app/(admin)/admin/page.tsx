import { Header } from "@/components/layout/header";
import { AdminClient } from "@/components/admin/admin-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function AdminPage() {
  return (
    <div>
      <Header title="Admin Dashboard" subtitle="Manage users, subscriptions, and platform stats" />
      <div className="p-6">
        <AdminClient />
      </div>
    </div>
  );
}
