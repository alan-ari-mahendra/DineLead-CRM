export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "Up to 3 boards",
      "Up to 5 team members",
      "Basic task cards",
      "Kanban view",
      "100 MB file storage",
      "Community support",
    ],
  },
  pro: {
    name: "Pro",
    price: 5,
    priceId: process.env.STRIPE_PRICE_PRO,
    features: [
      "Unlimited boards",
      "Up to 25 team members",
      "Subtasks & dependencies",
      "Kanban, list & calendar views",
      "5 GB file storage",
      "Basic analytics & reports",
      "Slack & email integrations",
      "Priority email support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 10,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Custom fields & workflows",
      "Advanced permissions & roles",
      "SSO & SAML authentication",
      "50 GB file storage",
      "Advanced analytics & CSV exports",
      "API access & webhooks",
      "Dedicated account manager",
      "99.9% SLA uptime guarantee",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;
