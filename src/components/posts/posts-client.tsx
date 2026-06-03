"use client";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Plus, Sparkles, Calendar, Send, Trash2, Image as ImageIcon } from "lucide-react";
import { formatDateTime, truncate } from "@/lib/utils";

const statusVariant: Record<string, any> = {
  DRAFT: "secondary",
  SCHEDULED: "warning",
  PUBLISHED: "success",
  FAILED: "destructive",
};

export function PostsClient() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [generating, setGenerating] = React.useState(false);

  const [form, setForm] = React.useState({
    pageId: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    scheduledAt: "",
    status: "DRAFT" as string,
    aiPrompt: "",
  });

  const { data: pagesData } = useQuery({
    queryKey: ["fb-pages"],
    queryFn: () => axios.get("/api/facebook/pages").then((r) => r.data),
  });
  const pages: any[] = pagesData ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["posts", filterStatus],
    queryFn: () =>
      axios
        .get(`/api/posts${filterStatus !== "all" ? `?status=${filterStatus}` : ""}`)
        .then((r) => r.data),
  });
  const posts: any[] = data?.posts ?? [];

  const createPost = useMutation({
    mutationFn: (body: any) => axios.post("/api/posts", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      setOpen(false);
      setForm({ pageId: "", content: "", imageUrl: "", linkUrl: "", scheduledAt: "", status: "DRAFT", aiPrompt: "" });
      addToast("Post created successfully!", "success");
    },
    onError: (err: any) => addToast(err.response?.data?.error ?? "Failed to create post", "error"),
  });

  const deletePost = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/posts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      addToast("Post deleted", "success");
    },
    onError: () => addToast("Failed to delete post", "error"),
  });

  const handleGenerate = async () => {
    if (!form.aiPrompt) return;
    setGenerating(true);
    try {
      const { data } = await axios.post("/api/ai/generate", { prompt: form.aiPrompt });
      setForm((f) => ({ ...f, content: data.content }));
      addToast(`Content generated! ${data.creditsRemaining} credits remaining.`, "success");
    } catch (err: any) {
      addToast(err.response?.data?.error ?? "Failed to generate content", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = (status: string) => {
    if (!form.pageId || !form.content) {
      addToast("Page and content are required", "error");
      return;
    }
    createPost.mutate({ ...form, status });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {["all", "DRAFT", "SCHEDULED", "PUBLISHED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === s
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Posts list */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading posts...</div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No posts yet</p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Create your first post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {posts.map((post: any) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={statusVariant[post.status]}>{post.status}</Badge>
                      {post.aiGenerated && (
                        <Badge variant="secondary">
                          <Sparkles className="h-3 w-3 mr-1" /> AI
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400">{post.page?.name}</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {truncate(post.content, 200)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {post.scheduledAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Scheduled: {formatDateTime(post.scheduledAt)}
                        </span>
                      )}
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Send className="h-3 w-3" />
                          Published: {formatDateTime(post.publishedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deletePost.mutate(post.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Post Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* AI Generator */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
              <p className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-1">
                <Sparkles className="h-4 w-4" /> AI Content Generator
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Describe what you want to post about..."
                  value={form.aiPrompt}
                  onChange={(e) => setForm((f) => ({ ...f, aiPrompt: e.target.value }))}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  onClick={handleGenerate}
                  loading={generating}
                  className="shrink-0"
                >
                  <Sparkles className="h-4 w-4" /> Generate
                </Button>
              </div>
            </div>

            {/* Page selector */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Facebook Page *
              </label>
              {pages.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                  No pages connected.{" "}
                  <a href="/dashboard/pages" className="underline">
                    Connect a Facebook Page first
                  </a>
                </p>
              ) : (
                <Select
                  value={form.pageId}
                  onValueChange={(v) => setForm((f) => ({ ...f, pageId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Post Content *
              </label>
              <Textarea
                placeholder="What's on your mind?"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={5}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {form.content.length} characters
              </p>
            </div>

            {/* Image URL */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1">
                <ImageIcon className="h-4 w-4" /> Image URL (optional)
              </label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>

            {/* Schedule */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Schedule for (optional)
              </label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleSubmit("DRAFT")}
                loading={createPost.isPending}
              >
                Save Draft
              </Button>
              {form.scheduledAt && (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleSubmit("SCHEDULED")}
                  loading={createPost.isPending}
                >
                  <Calendar className="h-4 w-4" /> Schedule
                </Button>
              )}
              <Button
                className="flex-1"
                onClick={() => handleSubmit("PUBLISHED")}
                loading={createPost.isPending}
              >
                <Send className="h-4 w-4" /> Publish Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
