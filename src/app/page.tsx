import Link from "next/link";
import { Zap, BarChart3, Users, Sparkles, Shield, Check, ArrowRight } from "lucide-react";
import { FacebookIcon } from "@/components/ui/facebook-icon";

const FEATURES = [
  {
    icon: <FacebookIcon className="h-6 w-6 text-blue-500" />,
    title: "Facebook Page Management",
    desc: "Connect unlimited pages, schedule posts, and manage your entire Facebook presence from one place.",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-purple-500" />,
    title: "AI Content Generation",
    desc: "Generate engaging Facebook posts in seconds using GPT-4o. Never run out of content ideas again.",
  },
  {
    icon: <Users className="h-6 w-6 text-green-500" />,
    title: "Lead Capture & CRM",
    desc: "Automatically capture leads from your pages and manage them through a built-in CRM pipeline.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
    title: "Analytics Dashboard",
    desc: "Track post engagement, lead conversion rates, and revenue in real-time with beautiful charts.",
  },
  {
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    title: "Auto-Reply to Messages",
    desc: "AI-powered auto-replies to Facebook Messenger inquiries so you never miss a potential customer.",
  },
  {
    icon: <Shield className="h-6 w-6 text-indigo-500" />,
    title: "White-Label Agency",
    desc: "Manage multiple client accounts and deliver results under your own brand with our agency plan.",
  },
];

const PLANS = [
  {
    name: "Free Trial",
    price: 0,
    period: "14 days",
    desc: "No credit card required",
    features: ["1 Facebook Page", "10 posts/month", "5 AI credits", "Basic lead capture"],
    cta: "Start Free Trial",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: 49,
    period: "/month",
    desc: "For growing businesses",
    features: [
      "5 Facebook Pages",
      "Unlimited posts",
      "100 AI credits/month",
      "Full CRM",
      "Auto-reply to messages",
      "Advanced analytics",
    ],
    cta: "Get Pro",
    href: "/register",
    highlight: true,
  },
  {
    name: "Agency",
    price: 149,
    period: "/month",
    desc: "For agencies & teams",
    features: [
      "Unlimited pages",
      "White-label dashboard",
      "500 AI credits/month",
      "Team member access",
      "API access",
      "Dedicated support",
    ],
    cta: "Get Agency",
    href: "/register",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">FB Auto Revenue Suite</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-700 mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Facebook Marketing Automation
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Automate Your Facebook
          <br />
          <span className="text-blue-600">Revenue Machine</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Schedule posts, capture leads, and grow your business on autopilot. Powered by AI
          and connected directly to your Facebook Pages.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Start Free Trial <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Sign In
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">14-day free trial · No credit card required</p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to grow</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              One platform to manage your Facebook marketing, capture leads, and convert them into revenue.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h2>
            <p className="text-gray-500">Start free, upgrade when you&apos;re ready</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border flex flex-col ${
                  plan.highlight
                    ? "border-blue-500 shadow-lg shadow-blue-100 bg-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.highlight && (
                  <div className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full self-start mb-3">
                    Most Popular
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{plan.desc}</p>
                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  )}
                  {plan.price === 0 && (
                    <span className="text-gray-400 text-sm"> · {plan.period}</span>
                  )}
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center font-semibold py-3 rounded-xl transition-colors ${
                    plan.highlight
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to automate your Facebook revenue?
          </h2>
          <p className="text-blue-100 mb-8">
            Join businesses already using FB Auto Revenue Suite to grow faster.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-blue-600 font-semibold px-8 py-4 rounded-xl transition-colors"
          >
            Start Your Free Trial <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">FB Auto Revenue Suite</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/login" className="hover:text-gray-900">Sign In</Link>
            <Link href="/register" className="hover:text-gray-900">Register</Link>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} FB Auto Revenue Suite. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
