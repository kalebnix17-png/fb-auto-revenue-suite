import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFacebookPages, subscribePage } from "@/lib/facebook";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const pages = await db.facebookPage.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { posts: true, leads: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(pages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { accessToken } = await req.json();
    if (!accessToken) {
      return Response.json({ error: "Access token required" }, { status: 400 });
    }

    const { data: fbPages } = await getFacebookPages(accessToken);

    const connected = await Promise.all(
      fbPages.map(async (fp: any) => {
        // Subscribe page to webhooks
        await subscribePage(fp.id, fp.access_token).catch(console.error);

        return db.facebookPage.upsert({
          where: { pageId: fp.id },
          create: {
            userId: session.user.id,
            pageId: fp.id,
            name: fp.name,
            accessToken: fp.access_token,
            category: fp.category,
            picture: fp.picture?.data?.url,
          },
          update: {
            name: fp.name,
            accessToken: fp.access_token,
            category: fp.category,
            picture: fp.picture?.data?.url,
            isActive: true,
          },
        });
      })
    );

    return Response.json(connected, { status: 201 });
  } catch (err: any) {
    console.error("Connect pages error:", err);
    return Response.json({ error: err.message ?? "Failed to connect pages" }, { status: 500 });
  }
}
