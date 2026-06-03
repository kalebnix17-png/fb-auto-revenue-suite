import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = schema.parse(await req.json());

  const user = await db.user.findFirst({
    where: {
      resetToken: body.token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return Response.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(body.password, 12);

  await db.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiry: null },
  });

  return Response.json({ success: true });
}
