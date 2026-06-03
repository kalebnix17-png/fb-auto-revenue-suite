import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      aiCredits: true,
      createdAt: true,
      subscription: true,
      facebookPages: { select: { id: true, name: true, isActive: true } },
    },
  });

  if (!user) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const schema = z.object({
    name: z.string().min(2).optional(),
    image: z.string().url().optional(),
  });

  const body = schema.parse(await req.json());

  const user = await db.user.update({
    where: { id: session.user.id },
    data: body,
    select: { id: true, name: true, email: true, image: true },
  });

  return Response.json({ user });
}
