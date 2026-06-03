import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers,
    activeSubscriptions,
    totalRevenue,
    totalLeads,
    totalPosts,
    recentUsers,
    planBreakdown,
  ] = await Promise.all([
    db.user.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.invoice.aggregate({ _sum: { amount: true } }),
    db.lead.count(),
    db.post.count(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    db.subscription.groupBy({
      by: ["plan"],
      _count: true,
    }),
  ]);

  return Response.json({
    totalUsers,
    activeSubscriptions,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    totalLeads,
    totalPosts,
    recentUsers,
    planBreakdown,
  });
}
