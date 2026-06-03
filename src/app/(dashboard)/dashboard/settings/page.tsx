import { Header } from "@/components/layout/header";
import { SettingsClient } from "@/components/settings/settings-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" subtitle="Manage your account and preferences" />
      <div className="p-6">
        <SettingsClient />
      </div>
    </div>
  );
}
