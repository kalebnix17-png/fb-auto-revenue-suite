import { db } from "@/lib/db";
import { generateAutoReply } from "@/lib/openai";
import { sendMessengerMessage } from "@/lib/facebook";

const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN ?? "fb_auto_revenue_verify";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body.object !== "page") {
    return Response.json({ status: "ignored" });
  }

  for (const entry of body.entry ?? []) {
    const pageId = entry.id;

    const page = await db.facebookPage.findUnique({
      where: { pageId },
      include: { user: true },
    });

    if (!page) continue;

    for (const event of entry.messaging ?? []) {
      if (!event.message?.text) continue;

      const senderId = event.sender.id;
      const messageText: string = event.message.text;

      // Store lead if new
      let lead = await db.lead.findFirst({
        where: { userId: page.userId, metadata: { path: ["psid"], equals: senderId } },
      });

      if (!lead) {
        lead = await db.lead.create({
          data: {
            userId: page.userId,
            pageId: page.id,
            name: `Messenger User ${senderId.slice(-4)}`,
            source: `Facebook Messenger - ${page.name}`,
            status: "NEW",
            metadata: { psid: senderId },
          },
        });

        await db.notification.create({
          data: {
            userId: page.userId,
            title: "New Messenger Lead",
            message: `A new lead from Messenger on page "${page.name}"`,
            type: "lead",
          },
        });
      }

      // Store message
      await db.leadMessage.create({
        data: { leadId: lead.id, content: messageText, isFromBot: false },
      });

      // Generate and send AI auto-reply
      try {
        const reply = await generateAutoReply(messageText, page.name);
        await sendMessengerMessage(senderId, reply, page.accessToken);
        await db.leadMessage.create({
          data: { leadId: lead.id, content: reply, isFromBot: true },
        });
      } catch (err) {
        console.error("Auto-reply failed:", err);
      }
    }
  }

  return Response.json({ status: "ok" });
}
