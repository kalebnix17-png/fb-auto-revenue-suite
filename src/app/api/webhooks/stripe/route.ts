import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendSubscriptionEmail } from "@/lib/email";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature error:", err);
    return Response.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, plan } = session.metadata ?? {};
        if (!userId || !plan) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        // Period fields cast via any — runtime API still provides them
        const sub = subscription as any;

        await db.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            plan: plan as any,
            status: "ACTIVE",
            currentPeriodStart: sub.current_period_start
              ? new Date(sub.current_period_start * 1000)
              : null,
            currentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
          },
          update: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            plan: plan as any,
            status: "ACTIVE",
            currentPeriodStart: sub.current_period_start
              ? new Date(sub.current_period_start * 1000)
              : null,
            currentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
          },
        });

        const aiCredits = plan === "AGENCY" ? 500 : 100;
        await db.user.update({ where: { id: userId }, data: { aiCredits } });

        const user = await db.user.findUnique({ where: { id: userId } });
        if (user?.email) {
          sendSubscriptionEmail(user.email, user.name ?? "User", plan, "upgraded").catch(console.error);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const rawSub = sub as any;
        const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
        const user = await db.user.findFirst({ where: { stripeCustomerId: customer.id } });
        if (!user) break;

        await db.subscription.update({
          where: { userId: user.id },
          data: {
            status: sub.status.toUpperCase() as any,
            currentPeriodStart: rawSub.current_period_start
              ? new Date(rawSub.current_period_start * 1000)
              : undefined,
            currentPeriodEnd: rawSub.current_period_end
              ? new Date(rawSub.current_period_end * 1000)
              : undefined,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
        const user = await db.user.findFirst({ where: { stripeCustomerId: customer.id } });
        if (!user) break;

        await db.subscription.update({
          where: { userId: user.id },
          data: { plan: "FREE", status: "CANCELED" },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
        const user = await db.user.findFirst({ where: { stripeCustomerId: customer.id } });
        if (!user) break;

        await db.invoice.create({
          data: {
            userId: user.id,
            stripeInvoiceId: invoice.id,
            amount: (invoice.amount_paid ?? 0) / 100,
            currency: invoice.currency,
            status: "paid",
            paidAt: new Date(),
          },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
  }

  return Response.json({ received: true });
}
