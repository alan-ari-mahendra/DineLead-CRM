import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }

    // Retrieve checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Verify this checkout belongs to current user
    if (checkoutSession.metadata?.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const plan = checkoutSession.metadata?.plan;
    const subscriptionId = checkoutSession.subscription as string;

    if (!plan || !subscriptionId) {
      return NextResponse.json(
        { error: "Missing subscription data" },
        { status: 400 }
      );
    }

    // Retrieve subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Upsert subscription in DB
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: subscription.items.data[0]?.price?.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000
        ),
        plan,
        status: "active",
      },
      update: {
        stripeSubscriptionId: subscriptionId,
        stripePriceId: subscription.items.data[0]?.price?.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000
        ),
        plan,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("Stripe verify error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
