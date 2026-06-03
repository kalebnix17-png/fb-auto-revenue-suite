"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Input } from "@/components/ui/input";
import { Users, CreditCard, DollarSign, TrendingUp, Search } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export function AdminClient() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => axios.get("/api/admin/stats").then((r) => r.data),
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: ["admin-users", search, page],
    queryFn: () =>
      axios.get(`/api/admin/users?search=${search}&page=${page}&limit=20`).then((r) => r.data),
  });

  const users: any[] = userData?.users ?? [];
  const total: number = userData?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const planColor: Record<string, any> = {
    FREE: "secondary",
    PRO: "default",
    AGENCY: "warning",
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions ?? 0}
          icon={<CreditCard className="h-6 w-6" />}
          color="green"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          icon={<DollarSign className="h-6 w-6" />}
          color="orange"
        />
        <StatsCard
          title="Total Leads"
          value={stats?.totalLeads ?? 0}
          icon={<TrendingUp className="h-6 w-6" />}
          color="purple"
        />
      </div>

      {/* Plan breakdown */}
      {stats?.planBreakdown && (
        <div className="grid grid-cols-3 gap-4">
          {stats.planBreakdown.map((p: any) => (
            <Card key={p.plan}>
              <CardContent className="pt-5">
                <p className="text-2xl font-bold text-gray-900">{p._count}</p>
                <p className="text-sm text-gray-500">{p.plan} plan</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Users table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>All Users ({total})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search users..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Plan</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Pages</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Leads</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{u.name ?? "—"}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === "ADMIN" ? "destructive" : "secondary"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={planColor[u.subscription?.plan] ?? "secondary"}>
                          {u.subscription?.plan ?? "FREE"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u._count?.facebookPages ?? 0}</td>
                      <td className="px-4 py-3 text-gray-500">{u._count?.leads ?? 0}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
