import { User } from "@prisma/client";
import { stripe } from "../lib/stripe";

type Plan = {
  name: string;
  slug: string;
  quota: number;
  pagesPerPdf: number;
  price: {
    amount: number;
    priceIds: {
      test: string;
      prod: string;
    };
  };
};
export const PLANS: Plan[] = [
  {
    name: "Free",
    slug: "free",
    quota: 10,
    pagesPerPdf: 5,
    price: {
      amount: 0,
      priceIds: {
        test: "",
        prod: "",
      },
    },
  },
  {
    name: "Pro",
    slug: "pro",
    quota: 50,
    pagesPerPdf: 25,
    price: {
      amount: 11.99,
      priceIds: {
        test: "price_1PudbIIErLl5zmlsQqvoaGxd",
        prod: "",
      },
    },
  },
];

export type SubscriptionPlanType = {
  stripeSubscriptionId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
  isSubscribed: boolean;
  isCanceled: boolean;
} & Plan;

export async function getUserSubscriptionPlan(
  user: User
): Promise<SubscriptionPlanType> {
  const isSubscribed = Boolean(
    user.stripePriceId &&
      user.stripeCurrentPeriodEnd && // 86400000 = 1 day
      user.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  );

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === user.stripePriceId)
    : PLANS[0];

  let isCanceled = false;

  if (isSubscribed && user.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return {
    ...plan!,
    stripeSubscriptionId: user.stripeSubscriptionId,
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
    stripeCustomerId: user.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
