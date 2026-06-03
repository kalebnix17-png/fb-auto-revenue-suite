import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await db.post.findFirst({
    where: { id, userId: session.user.id },
    include: { page: { select: { name: true, picture: true } } },
  });

  if (!post) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(post);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const post = await db.post.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });

  const updated = await db.post.update({
    where: { id },
    data: {
      content: body.content,
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      status: body.status,
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await db.post.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });

  await db.post.delete({ where: { id } });
  return Response.json({ message: "Deleted" });
}
