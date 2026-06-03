"use client";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, RefreshCw, Globe, Users, CheckCircle, XCircle } from "lucide-react";
import { FacebookIcon } from "@/components/ui/facebook-icon";
import { formatDate } from "@/lib/utils";

export function PagesClient() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["facebook-pages"],
    queryFn: () => axios.get("/api/facebook/pages").then((r) => r.data),
  });
  const pages: any[] = data?.pages ?? [];

  const connectPages = useMutation({
    mutationFn: (token: string) => axios.post("/api/facebook/pages", { accessToken: token }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["facebook-pages"] });
      setOpen(false);
      setAccessToken("");
      const count = res.data?.pages?.length ?? 0;
      addToast(`Connected ${count} page${count !== 1 ? "s" : ""}!`, "success");
    },
    onError: () => addToast("Failed to connect pages. Check your access token.", "error"),
  });

  const deletePage = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/facebook/pages/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facebook-pages"] });
      addToast("Page disconnected", "success");
    },
    onError: () => addToast("Failed to disconnect page", "error"),
  });

  const togglePage = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      axios.patch(`/api/facebook/pages/${id}`, { isActive: active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["facebook-pages"] }),
    onError: () => addToast("Failed to update page", "error"),
  });

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {pages.length} page{pages.length !== 1 ? "s" : ""} connected
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Connect Pages
        </Button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <FacebookIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">How to connect your Facebook Pages</p>
          <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
            <li>Go to the Facebook Graph API Explorer at developers.facebook.com</li>
            <li>Generate a User Access Token with <code className="bg-blue-100 px-1 rounded">pages_manage_posts</code>, <code className="bg-blue-100 px-1 rounded">pages_read_engagement</code>, and <code className="bg-blue-100 px-1 rounded">pages_messaging</code> permissions</li>
            <li>Paste the token below and click Connect</li>
          </ol>
        </div>
      </div>

      {/* Pages grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FacebookIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No pages connected yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Connect your Facebook Pages to start publishing and capturing leads
            </p>
            <Button className="mt-4" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Connect Your First Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page: any) => (
            <Card key={page.id} className="overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 h-16 relative">
                {page.picture && (
                  <img
                    src={page.picture}
                    alt={page.name}
                    className="absolute -bottom-6 left-4 h-12 w-12 rounded-full border-2 border-white object-cover"
                  />
                )}
                {!page.picture && (
                  <div className="absolute -bottom-6 left-4 h-12 w-12 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center">
                    <FacebookIcon className="h-6 w-6 text-blue-600" />
                  </div>
                )}
              </div>
              <CardContent className="pt-8 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{page.name}</p>
                    {page.category && (
                      <p className="text-xs text-gray-400 mt-0.5">{page.category}</p>
                    )}
                  </div>
                  <Badge variant={page.isActive ? "success" : "secondary"}>
                    {page.isActive ? "Active" : "Paused"}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  {page.followersCount != null && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{page.followersCount.toLocaleString()} followers</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span>Connected {formatDate(page.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => togglePage.mutate({ id: page.id, active: !page.isActive })}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                    title={page.isActive ? "Pause page" : "Activate page"}
                  >
                    {page.isActive ? (
                      <><XCircle className="h-3.5 w-3.5" /> Pause</>
                    ) : (
                      <><CheckCircle className="h-3.5 w-3.5" /> Activate</>
                    )}
                  </button>
                  <span className="text-gray-200">|</span>
                  <button
                    onClick={() => {
                      if (confirm(`Disconnect "${page.name}"? This will also remove scheduled posts for this page.`)) {
                        deletePage.mutate(page.id);
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Disconnect
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Connect dialog */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setAccessToken(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Facebook Pages</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-gray-500">
              Enter your Facebook User Access Token. We&apos;ll fetch all pages you manage and connect them automatically.
            </p>
            <Input
              placeholder="Paste your Facebook User Access Token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  if (!accessToken.trim()) {
                    addToast("Please enter an access token", "error");
                    return;
                  }
                  connectPages.mutate(accessToken.trim());
                }}
                loading={connectPages.isPending}
              >
                <RefreshCw className="h-4 w-4" /> Connect Pages
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
