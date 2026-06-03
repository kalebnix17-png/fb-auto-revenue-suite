import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { plan } = await req.json();
    if (plan !== "PRO" && plan !== "AGENCY") {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = PLANS[plan as keyof typeof PLANS].priceId;
    if (!priceId) {
      return Response.json({ error: "Price not configured" }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: { userId: user.id, plan },
      subscription_data: {
        trial_period_days:
          user.subscription?.status === "TRIALING" ? undefined : 0,
      },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
