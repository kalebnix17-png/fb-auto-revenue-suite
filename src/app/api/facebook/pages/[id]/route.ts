import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const page = await db.facebookPage.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!page) return Response.json({ error: "Not found" }, { status: 404 });

  const updated = await db.facebookPage.update({
    where: { id },
    data: { isActive: body.isActive },
  });

  return Response.json({ page: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const page = await db.facebookPage.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!page) return Response.json({ error: "Not found" }, { status: 404 });

  await db.facebookPage.delete({ where: { id } });

  return Response.json({ success: true });
}
