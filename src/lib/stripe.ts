import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free Trial",
    price: 0,
    priceId: null,
    features: [
      "1 Facebook Page",
      "5 Scheduled Posts/month",
      "10 AI Credits",
      "Basic Analytics",
      "50 Leads",
    ],
    limits: {
      pages: 1,
      posts: 5,
      aiCredits: 10,
      leads: 50,
    },
  },
  PRO: {
    name: "Pro",
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "5 Facebook Pages",
      "Unlimited Scheduled Posts",
      "100 AI Credits/month",
      "Advanced Analytics",
      "Unlimited Leads",
      "Auto-Reply Bots",
      "Priority Support",
    ],
    limits: {
      pages: 5,
      posts: -1,
      aiCredits: 100,
      leads: -1,
    },
  },
  AGENCY: {
    name: "Agency",
    price: 149,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID,
    features: [
      "Unlimited Facebook Pages",
      "Unlimited Scheduled Posts",
      "500 AI Credits/month",
      "White-label Dashboard",
      "Team Members",
      "Client Management",
      "API Access",
      "Dedicated Support",
    ],
    limits: {
      pages: -1,
      posts: -1,
      aiCredits: 500,
      leads: -1,
    },
  },
} as const;
