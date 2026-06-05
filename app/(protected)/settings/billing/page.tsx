"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2, CreditCard, Crown, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { PLANS, type PlanType } from "@/lib/plans";
import Link from "next/link";

export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const currentPlan = (session?.user?.subscription?.plan || "free") as PlanType;
  const subscriptionStatus = session?.user?.subscription?.status || "active";

  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");
    const canceled = searchParams.get("canceled");

    if (success && sessionId) {
      // Verify checkout and save subscription to DB
      fetch("/api/stripe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            toast.success(
              "Payment successful! Your subscription has been activated."
            );
            update(); // refresh NextAuth session
          } else {
            toast.error(data.error || "Failed to verify payment");
          }
        })
        .catch(() => {
          toast.error("Failed to verify payment");
        })
        .finally(() => {
          window.history.replaceState({}, "", "/settings/billing");
        });
    }

    if (canceled) {
      toast.error("Payment was canceled.");
      window.history.replaceState({}, "", "/settings/billing");
    }
  }, [searchParams, update]);

  const handleUpgrade = async (plan: PlanType) => {
    if (plan === "free") return;

    setIsLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      window.location.href = data.url;
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
      setIsLoading(null);
    }
  };

  const planCards = [
    {
      key: "free" as PlanType,
      name: "Free",
      description: "For individuals & small side projects",
      price: 0,
      popular: false,
    },
    {
      key: "pro" as PlanType,
      name: "Pro",
      description: "For growing teams that need more power",
      price: 5,
      popular: true,
    },
    {
      key: "enterprise" as PlanType,
      name: "Enterprise",
      description: "For organizations that need full control",
      price: 10,
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-5 md:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Billing & Subscription
          </h1>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Manage your subscription plans and billing preferences.
        </p>
      </div>

      {/* Current Plan Info */}
      <Card className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-50 bg-gray-50/20">
          <CardTitle className="text-base font-bold text-gray-900 tracking-tight">Current Plan</CardTitle>
          <CardDescription className="text-xs text-gray-400">Your current subscription plan status and metrics</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 capitalize">
                    {PLANS[currentPlan]?.name || "Free"}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-full text-[11px] font-medium px-2.5 py-0.5 shadow-none border",
                      subscriptionStatus === "active"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-50"
                        : subscriptionStatus === "past_due"
                          ? "bg-amber-50 text-amber-800 border-amber-100 hover:bg-amber-50"
                          : "bg-slate-50 text-slate-800 border-slate-100 hover:bg-slate-50"
                    )}
                  >
                    {subscriptionStatus}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  ${PLANS[currentPlan]?.price || 0}/month · Billing via Stripe
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {planCards.map((plan) => {
          const isCurrentPlan = currentPlan === plan.key;
          const isDowngrade =
            planCards.findIndex((p) => p.key === currentPlan) >
            planCards.findIndex((p) => p.key === plan.key);

          return (
            <Card
              key={plan.key}
              className={cn(
                "relative flex flex-col bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 overflow-hidden",
                plan.popular && "border-2 border-emerald-600 shadow-md hover:shadow-[0_6px_20px_rgba(4,120,87,0.08)]",
                isCurrentPlan && !plan.popular && "border border-emerald-200"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-700 text-white shadow-sm rounded-full text-[10px] font-semibold px-2.5 py-0.5 border-none">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="p-6 pb-4 border-b border-gray-50/50">
                <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">{plan.name}</CardTitle>
                <CardDescription className="text-xs text-gray-400 mt-1">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 p-6 space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 tracking-tight">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-xs font-medium text-gray-400">/month</span>
                  )}
                </div>

                <Separator className="border-gray-100" />

                <ul className="space-y-3">
                  {PLANS[plan.key].features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-600 leading-normal">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-6 pt-2">
                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full h-10 font-semibold border-gray-200 text-gray-400 rounded-xl" disabled>
                    Current Plan
                  </Button>
                ) : isDowngrade ? (
                  <Button
                    variant="outline"
                    className="w-full h-10 font-semibold border-gray-200 text-gray-400 rounded-xl"
                    disabled
                    title="Downgrading is not available yet"
                  >
                    Downgrade
                  </Button>
                ) : (
                  <Button
                    className={cn(
                      "w-full h-10 font-semibold shadow-sm transition-all rounded-xl",
                      plan.popular
                        ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                        : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                    )}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={isLoading !== null}
                  >
                    {isLoading === plan.key ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <Card className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-3 text-sm text-gray-500 leading-relaxed">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span>
                <strong>Test Mode:</strong> This subscription system is running in sandbox test environment.
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span>
                Use Stripe test card: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-800 font-bold border border-emerald-100">4242 4242 4242 4242</code>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span>
                Need to test different payment flows? See the{" "}
                <Link
                  href="https://stripe.com/docs/testing"
                  target="_blank"
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Stripe Testing Documentation
                </Link>
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
