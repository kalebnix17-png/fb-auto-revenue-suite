import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DashboardCharts } from "@/components/dashboard/charts";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { RecentPosts } from "@/components/dashboard/recent-posts";
import { Users, FileText, TrendingUp, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalLeads,
    newLeads,
    convertedLeads,
    publishedPosts,
    revenue,
    recentLeads,
    recentPosts,
    subscription,
  ] = await Promise.all([
    db.lead.count({ where: { userId } }),
    db.lead.count({ where: { userId, createdAt: { gte: since30d } } }),
    db.lead.count({ where: { userId, status: "CONVERTED" } }),
    db.post.count({ where: { userId, status: "PUBLISHED" } }),
    db.lead.aggregate({
      where: { userId, status: "CONVERTED" },
      _sum: { revenue: true },
    }),
    db.lead.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { page: { select: { name: true } } },
    }),
    db.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { page: { select: { name: true } } },
    }),
    db.subscription.findUnique({ where: { userId } }),
  ]);

  const conversionRate =
    totalLeads > 0
      ? ((convertedLeads / totalLeads) * 100).toFixed(1)
      : "0";

  return (
    <div>
      <Header
        title={`Welcome back, ${session?.user?.name?.split(" ")[0] ?? "there"}! 👋`}
        subtitle="Here's what's happening with your Facebook marketing"
      />

      <div className="p-6 space-y-6">
        {/* Subscription banner */}
        {subscription?.plan === "FREE" && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white flex items-center justify-between">
            <div>
              <p className="font-semibold">You're on the Free Trial</p>
              <p className="text-sm text-blue-100">
                Upgrade to Pro to unlock unlimited posts, leads & AI credits
              </p>
            </div>
            <a
              href="/dashboard/billing"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50"
            >
              Upgrade Now
            </a>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Leads"
            value={totalLeads}
            icon={<Users className="h-6 w-6" />}
            change={12}
            changeLabel="vs last month"
            color="blue"
          />
          <StatsCard
            title="New Leads (30d)"
            value={newLeads}
            icon={<TrendingUp className="h-6 w-6" />}
            change={8}
            changeLabel="vs last month"
            color="green"
          />
          <StatsCard
            title="Posts Published"
            value={publishedPosts}
            icon={<FileText className="h-6 w-6" />}
            change={-2}
            changeLabel="vs last month"
            color="purple"
          />
          <StatsCard
            title="Revenue"
            value={formatCurrency(revenue._sum.revenue ?? 0)}
            icon={<DollarSign className="h-6 w-6" />}
            change={15}
            changeLabel="vs last month"
            color="orange"
          />
        </div>

        {/* Charts row */}
        <DashboardCharts userId={userId} />

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentLeads leads={recentLeads as any} />
          <RecentPosts posts={recentPosts as any} />
        </div>
      </div>
    </div>
  );
}
