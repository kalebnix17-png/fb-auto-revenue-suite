"use client";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Plus, Search, Mail, Phone, User, Trash2, Edit2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];
const statusVariant: Record<string, any> = {
  NEW: "default",
  CONTACTED: "secondary",
  QUALIFIED: "warning",
  CONVERTED: "success",
  LOST: "destructive",
};

export function LeadsClient() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [editLead, setEditLead] = React.useState<any>(null);
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", source: "", notes: "", status: "NEW",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["leads", search, filterStatus],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterStatus !== "all") params.set("status", filterStatus);
      return axios.get(`/api/leads?${params}`).then((r) => r.data);
    },
  });
  const leads: any[] = data?.leads ?? [];

  const createLead = useMutation({
    mutationFn: (body: any) => axios.post("/api/leads", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      setOpen(false);
      resetForm();
      addToast("Lead created!", "success");
    },
    onError: () => addToast("Failed to create lead", "error"),
  });

  const updateLead = useMutation({
    mutationFn: ({ id, ...body }: any) => axios.patch(`/api/leads/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      setEditLead(null);
      addToast("Lead updated!", "success");
    },
    onError: () => addToast("Failed to update lead", "error"),
  });

  const deleteLead = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/leads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      addToast("Lead deleted", "success");
    },
  });

  const resetForm = () =>
    setForm({ name: "", email: "", phone: "", source: "", notes: "", status: "NEW" });

  const handleOpenEdit = (lead: any) => {
    setEditLead(lead);
    setForm({
      name: lead.name,
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      source: lead.source ?? "",
      notes: lead.notes ?? "",
      status: lead.status,
    });
  };

  const handleSubmit = () => {
    if (!form.name) { addToast("Name is required", "error"); return; }
    if (editLead) {
      updateLead.mutate({ id: editLead.id, ...form });
    } else {
      createLead.mutate(form);
    }
  };

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Status summary */}
      <div className="grid grid-cols-5 gap-3">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
            className={`rounded-xl border p-3 text-center transition-all ${
              filterStatus === s ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">
              {leads.filter((l) => l.status === s).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button onClick={() => { resetForm(); setEditLead(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Lead
        </Button>
      </div>

      {/* Leads table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Contact</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Source</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Created</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No leads found. Start capturing leads from your Facebook Pages!
                  </td>
                </tr>
              ) : (
                leads.map((lead: any) => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          {lead.revenue && (
                            <p className="text-xs text-green-600">${lead.revenue}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {lead.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">{lead.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {lead.source ?? lead.page?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[lead.status]}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { handleOpenEdit(lead); setOpen(true); }}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteLead.mutate(lead.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { resetForm(); setEditLead(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editLead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              placeholder="Full name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <Input
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <Input
              placeholder="Source (e.g. Facebook Ad, Messenger)"
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
            />
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Notes..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
            />
            <Button
              className="w-full"
              onClick={handleSubmit}
              loading={createLead.isPending || updateLead.isPending}
            >
              {editLead ? "Update Lead" : "Create Lead"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
