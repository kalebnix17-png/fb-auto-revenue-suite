"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, FileText, TrendingUp, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export function AnalyticsClient() {
  const [range, setRange] = React.useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics-full", range],
    queryFn: () => axios.get(`/api/analytics?range=${range}`).then((r) => r.data),
  });

  const ov = data?.overview;

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex items-center gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setRange(d)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              range === d
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {d === 7 ? "Last 7 days" : d === 30 ? "Last 30 days" : "Last 90 days"}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Leads"
          value={isLoading ? "—" : ov?.totalLeads ?? 0}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title="New Leads"
          value={isLoading ? "—" : ov?.newLeads ?? 0}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <StatsCard
          title="Conversion Rate"
          value={isLoading ? "—" : `${ov?.conversionRate ?? 0}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="purple"
        />
        <StatsCard
          title="Revenue"
          value={isLoading ? "—" : formatCurrency(ov?.totalRevenue ?? 0)}
          icon={<DollarSign className="h-6 w-6" />}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads over time */}
        <Card>
          <CardHeader>
            <CardTitle>Leads Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.chartData ?? []}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })
                } />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stroke="#3B82F6" fill="url(#grad1)" name="Leads" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Posts over time */}
        <Card>
          <CardHeader>
            <CardTitle>Posts Published</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.chartData ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })
                } />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="posts" fill="#10B981" radius={[3, 3, 0, 0]} name="Posts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={
                    data?.leadsByStatus?.map((s: any) => ({
                      name: s.status.charAt(0) + s.status.slice(1).toLowerCase(),
                      value: s._count,
                    })) ?? []
                  }
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {(data?.leadsByStatus ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Post status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Post Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                layout="vertical"
                data={
                  data?.postsByStatus?.map((s: any) => ({
                    name: s.status.charAt(0) + s.status.slice(1).toLowerCase(),
                    count: s._count,
                  })) ?? []
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 3, 3, 0]} name="Posts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
