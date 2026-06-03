"use client";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Check, Zap, Shield, Building2, CreditCard, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const PLANS = [
  {
    id: "FREE",
    name: "Free Trial",
    price: 0,
    period: "",
    description: "Get started with the basics",
    color: "gray",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "1 Facebook Page",
      "10 posts per month",
      "Basic lead capture",
      "5 AI credits",
      "Email support",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 49,
    period: "/month",
    description: "For growing businesses",
    color: "blue",
    icon: <Shield className="h-6 w-6" />,
    popular: true,
    features: [
      "5 Facebook Pages",
      "Unlimited posts",
      "Full CRM + lead management",
      "100 AI credits/month",
      "Auto-reply to messages",
      "Advanced analytics",
      "Priority support",
    ],
  },
  {
    id: "AGENCY",
    name: "Agency",
    price: 149,
    period: "/month",
    description: "For agencies and teams",
    color: "purple",
    icon: <Building2 className="h-6 w-6" />,
    features: [
      "Unlimited Facebook Pages",
      "Unlimited posts",
      "White-label dashboard",
      "500 AI credits/month",
      "Team member access",
      "API access",
      "Dedicated account manager",
    ],
  },
];

export function BillingClient() {
  const { addToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => axios.get("/api/user/profile").then((r) => r.data),
  });

  const { data: invoiceData } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => axios.get("/api/billing/invoices").then((r) => r.data),
  });

  const sub = data?.subscription;
  const currentPlan = sub?.plan ?? "FREE";

  const checkout = useMutation({
    mutationFn: (plan: string) =>
      axios.post("/api/stripe/create-checkout", { plan }).then((r) => r.data),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => addToast("Failed to start checkout. Please try again.", "error"),
  });

  const portal = useMutation({
    mutationFn: () => axios.post("/api/stripe/portal").then((r) => r.data),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => addToast("Failed to open billing portal.", "error"),
  });

  return (
    <div className="space-y-8">
      {/* Current subscription */}
      {!isLoading && sub && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{currentPlan}</p>
                  <Badge
                    variant={
                      sub.status === "ACTIVE"
                        ? "success"
                        : sub.status === "TRIALING"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {sub.status}
                  </Badge>
                </div>
                {sub.currentPeriodEnd && (
                  <p className="text-sm text-gray-500 mt-1">
                    {sub.status === "TRIALING"
                      ? `Trial ends ${formatDate(sub.trialEnd)}`
                      : `Renews ${formatDate(sub.currentPeriodEnd)}`}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-0.5">
                  {data?.user?.aiCredits ?? 0} AI credits remaining
                </p>
              </div>
              {currentPlan !== "FREE" && (
                <Button variant="outline" onClick={() => portal.mutate()} loading={portal.isPending}>
                  <ExternalLink className="h-4 w-4" />
                  Manage Billing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const colorMap: Record<string, string> = {
              gray: "bg-gray-100 text-gray-600",
              blue: "bg-blue-100 text-blue-600",
              purple: "bg-purple-100 text-purple-600",
            };
            const btnMap: Record<string, string> = {
              gray: "",
              blue: "bg-blue-600 hover:bg-blue-700",
              purple: "bg-purple-600 hover:bg-purple-700",
            };

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  plan.popular
                    ? "border-blue-500 shadow-lg shadow-blue-100"
                    : "border-gray-200"
                } ${isCurrent ? "bg-gray-50" : "bg-white"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`h-12 w-12 rounded-xl ${colorMap[plan.color]} flex items-center justify-center mb-4`}>
                  {plan.icon}
                </div>

                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{plan.description}</p>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
                  </span>
                  {plan.period && (
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="text-center py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg">
                    Current Plan
                  </div>
                ) : plan.id === "FREE" ? (
                  <div className="text-center py-2 text-sm text-gray-400">
                    Downgrade not available
                  </div>
                ) : (
                  <Button
                    className={`w-full ${btnMap[plan.color]}`}
                    onClick={() => checkout.mutate(plan.id)}
                    loading={checkout.isPending}
                  >
                    Upgrade to {plan.name}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice history */}
      {invoiceData?.invoices?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice History</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Plan</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.invoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b border-gray-50">
                      <td className="px-4 py-3 text-gray-500">{formatDate(inv.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{inv.plan}</td>
                      <td className="px-4 py-3 text-gray-900">{formatCurrency(inv.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="success">Paid</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
