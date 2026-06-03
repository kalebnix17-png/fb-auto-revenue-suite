"use client";
import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Copy, RefreshCw, Zap, Check } from "lucide-react";

const TEMPLATES = [
  { label: "Product Promotion", prompt: "Write a Facebook post promoting our latest product. Highlight benefits and include a call to action." },
  { label: "Customer Story", prompt: "Write an engaging Facebook post sharing a customer success story. Make it relatable and inspiring." },
  { label: "Tips & Advice", prompt: "Create a helpful Facebook post with 3-5 actionable tips related to our industry. Use a numbered list format." },
  { label: "Behind the Scenes", prompt: "Write a behind-the-scenes Facebook post showing our team at work. Make it personal and authentic." },
  { label: "Flash Sale", prompt: "Create an urgent Facebook post announcing a limited-time sale. Include urgency words and a clear CTA." },
  { label: "Question Post", prompt: "Write an engaging question post that encourages followers to comment and share their opinions." },
];

export function AiClient() {
  const { addToast } = useToast();
  const [prompt, setPrompt] = React.useState("");
  const [generated, setGenerated] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const { data: profileData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => axios.get("/api/user/profile").then((r) => r.data),
  });
  const credits = profileData?.user?.aiCredits ?? 0;

  const generate = useMutation({
    mutationFn: (p: string) => axios.post("/api/ai/generate", { prompt: p }).then((r) => r.data),
    onSuccess: (data) => {
      setGenerated(data.content);
      addToast(`Post generated! ${data.creditsRemaining} credits remaining`, "success");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Failed to generate content";
      addToast(msg, "error");
    },
  });

  const handleCopy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast("Copied to clipboard!", "success");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Credits banner */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-4">
        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
          <Zap className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{credits} AI Credits remaining</p>
          <p className="text-xs text-gray-500">Each post generation uses 1 credit. Upgrade to get more.</p>
        </div>
      </div>

      {/* Templates */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Quick templates</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              onClick={() => setPrompt(t.prompt)}
              className="text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-xs text-gray-600 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400 mb-1" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generator form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generate Facebook Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe what you want to post about... (e.g. 'Write a post about our summer sale on handmade jewelry, targeting women 25-45')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => {
              if (!prompt.trim()) {
                addToast("Please enter a prompt", "error");
                return;
              }
              if (credits <= 0) {
                addToast("No credits remaining. Please upgrade your plan.", "error");
                return;
              }
              generate.mutate(prompt.trim());
            }}
            loading={generate.isPending}
            disabled={credits <= 0}
          >
            <Sparkles className="h-4 w-4" />
            {generate.isPending ? "Generating..." : "Generate Post"}
          </Button>
        </CardContent>
      </Card>

      {/* Generated result */}
      {generated && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Post</CardTitle>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generate.mutate(prompt)}
                  disabled={generate.isPending}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${generate.isPending ? "animate-spin" : ""}`} />
                  Regenerate
                </button>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {generated}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {generated.length} characters · {Math.ceil(generated.length / 280)} estimated screens
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
