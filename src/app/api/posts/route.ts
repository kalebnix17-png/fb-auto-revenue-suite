import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { publishPost, schedulePost } from "@/lib/facebook";
import { z } from "zod";

const createPostSchema = z.object({
  pageId: z.string(),
  content: z.string().min(1),
  imageUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
  scheduledAt: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const status = searchParams.get("status");
  const pageId = searchParams.get("pageId");

  const where: any = { userId: session.user.id };
  if (status) where.status = status;
  if (pageId) where.pageId = pageId;

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      include: { page: { select: { name: true, picture: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.post.count({ where }),
  ]);

  return Response.json({ posts, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = createPostSchema.parse(await req.json());

    const fbPage = await db.facebookPage.findFirst({
      where: { id: body.pageId, userId: session.user.id },
    });
    if (!fbPage) return Response.json({ error: "Page not found" }, { status: 404 });

    let facebookPostId: string | undefined;
    let status = body.status ?? "DRAFT";
    let publishedAt: Date | undefined;
    let scheduledAt: Date | undefined;

    if (body.scheduledAt && status === "SCHEDULED") {
      scheduledAt = new Date(body.scheduledAt);
      const result = await schedulePost(
        fbPage.pageId,
        fbPage.accessToken,
        body.content,
        scheduledAt,
        body.imageUrl
      );
      facebookPostId = result.id;
    } else if (status === "PUBLISHED") {
      const result = await publishPost(
        fbPage.pageId,
        fbPage.accessToken,
        body.content,
        body.imageUrl,
        body.linkUrl
      );
      facebookPostId = result.id;
      publishedAt = new Date();
    }

    const post = await db.post.create({
      data: {
        userId: session.user.id,
        pageId: body.pageId,
        content: body.content,
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl,
        status: status as any,
        scheduledAt,
        publishedAt,
        facebookPostId,
      },
    });

    return Response.json(post, { status: 201 });
  } catch (err: any) {
    console.error("Create post error:", err);
    return Response.json({ error: err.message ?? "Failed to create post" }, { status: 500 });
  }
}
