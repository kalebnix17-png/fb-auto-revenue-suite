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
  const lead = await db.lead.findFirst({
    where: { id, userId: session.user.id },
    include: {
      page: { select: { name: true } },
      messages: { orderBy: { sentAt: "asc" } },
    },
  });

  if (!lead) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(lead);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const lead = await db.lead.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!lead) return Response.json({ error: "Not found" }, { status: 404 });

  const updateData: any = {
    name: body.name,
    email: body.email,
    phone: body.phone,
    source: body.source,
    status: body.status,
    notes: body.notes,
    tags: body.tags,
    revenue: body.revenue,
  };

  if (body.status === "CONVERTED" && !lead.convertedAt) {
    updateData.convertedAt = new Date();
  }

  const updated = await db.lead.update({
    where: { id },
    data: updateData,
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
  const lead = await db.lead.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!lead) return Response.json({ error: "Not found" }, { status: 404 });

  await db.lead.delete({ where: { id } });
  return Response.json({ message: "Deleted" });
}
