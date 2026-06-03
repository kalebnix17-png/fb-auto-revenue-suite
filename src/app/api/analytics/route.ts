import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const range = parseInt(searchParams.get("range") ?? "30");
  const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000);

  const userId = session.user.id;

  const [
    totalLeads,
    newLeads,
    convertedLeads,
    totalPosts,
    publishedPosts,
    totalRevenue,
    recentLeads,
    recentPosts,
    leadsByStatus,
    postsByStatus,
  ] = await Promise.all([
    db.lead.count({ where: { userId } }),
    db.lead.count({ where: { userId, createdAt: { gte: since } } }),
    db.lead.count({ where: { userId, status: "CONVERTED" } }),
    db.post.count({ where: { userId } }),
    db.post.count({ where: { userId, status: "PUBLISHED" } }),
    db.lead.aggregate({
      where: { userId, status: "CONVERTED" },
      _sum: { revenue: true },
    }),
    db.lead.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, status: true },
    }),
    db.post.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, status: true },
    }),
    db.lead.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    db.post.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
  ]);

  const conversionRate =
    totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0";

  // Build daily chart data
  const dailyData: Record<string, { date: string; leads: number; posts: number }> = {};
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyData[key] = { date: key, leads: 0, posts: 0 };
  }

  recentLeads.forEach((l: { createdAt: Date }) => {
    const key = l.createdAt.toISOString().split("T")[0];
    if (dailyData[key]) dailyData[key].leads++;
  });

  recentPosts.forEach((p: { createdAt: Date }) => {
    const key = p.createdAt.toISOString().split("T")[0];
    if (dailyData[key]) dailyData[key].posts++;
  });

  return Response.json({
    overview: {
      totalLeads,
      newLeads,
      convertedLeads,
      conversionRate: parseFloat(conversionRate),
      totalPosts,
      publishedPosts,
      totalRevenue: totalRevenue._sum.revenue ?? 0,
    },
    leadsByStatus,
    postsByStatus,
    chartData: Object.values(dailyData),
  });
}
