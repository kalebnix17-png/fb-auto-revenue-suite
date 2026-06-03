import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateFacebookPost } from "@/lib/openai";
import { z } from "zod";

const generateSchema = z.object({
  prompt: z.string().min(5),
  tone: z.enum(["professional", "casual", "humorous", "urgent"]).optional(),
  industry: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { aiCredits: true, subscription: { select: { plan: true } } },
    });

    if (!user) return Response.json({ error: "User not found" }, { status: 404 });
    if (user.aiCredits <= 0) {
      return Response.json(
        { error: "No AI credits remaining. Upgrade your plan for more credits." },
        { status: 403 }
      );
    }

    const body = generateSchema.parse(await req.json());

    const toneInstruction = body.tone
      ? `Tone: ${body.tone}.`
      : "Tone: engaging and professional.";
    const industryContext = body.industry
      ? `Industry: ${body.industry}.`
      : "";

    const fullPrompt = `${toneInstruction} ${industryContext} ${body.prompt}`;
    const content = await generateFacebookPost(fullPrompt);

    // Deduct one AI credit
    await db.user.update({
      where: { id: session.user.id },
      data: { aiCredits: { decrement: 1 } },
    });

    return Response.json({ content, creditsRemaining: user.aiCredits - 1 });
  } catch (err: any) {
    console.error("AI generate error:", err);
    return Response.json({ error: err.message ?? "Failed to generate content" }, { status: 500 });
  }
}
