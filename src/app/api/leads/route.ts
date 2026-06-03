import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendLeadNotificationEmail } from "@/lib/email";
import { z } from "zod";

const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  pageId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: any = { userId: session.user.id };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [leads, total] = await Promise.all([
    db.lead.findMany({
      where,
      include: {
        page: { select: { name: true } },
        messages: { orderBy: { sentAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.lead.count({ where }),
  ]);

  return Response.json({ leads, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = createLeadSchema.parse(await req.json());

    const lead = await db.lead.create({
      data: {
        userId: session.user.id,
        ...body,
        tags: body.tags ?? [],
      },
    });

    // Send lead notification email (fire-and-forget)
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (user?.email) {
      sendLeadNotificationEmail(
        user.email,
        lead.name,
        lead.source ?? "Unknown"
      ).catch(console.error);
    }

    await db.notification.create({
      data: {
        userId: session.user.id,
        title: "New Lead",
        message: `New lead captured: ${lead.name}`,
        type: "lead",
      },
    });

    return Response.json(lead, { status: 201 });
  } catch (err: any) {
    console.error("Create lead error:", err);
    return Response.json({ error: err.message ?? "Failed to create lead" }, { status: 500 });
  }
}
