import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = schema.parse(await req.json());

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  });

  if (!user?.password) {
    return Response.json({ error: "No password set for this account" }, { status: 400 });
  }

  const valid = await bcrypt.compare(body.currentPassword, user.password);
  if (!valid) {
    return Response.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(body.newPassword, 12);
  await db.user.update({ where: { id: user.id }, data: { password: hashed } });

  return Response.json({ success: true });
}
