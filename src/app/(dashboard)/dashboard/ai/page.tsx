import { Header } from "@/components/layout/header";
import { AiClient } from "@/components/ai/ai-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Content Generator" };

export default function AiPage() {
  return (
    <div>
      <Header title="AI Content Generator" subtitle="Generate engaging Facebook posts with AI" />
      <div className="p-6">
        <AiClient />
      </div>
    </div>
  );
}
