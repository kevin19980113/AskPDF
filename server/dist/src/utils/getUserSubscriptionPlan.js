"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLANS = void 0;
exports.getUserSubscriptionPlan = getUserSubscriptionPlan;
const stripe_1 = require("../lib/stripe");
exports.PLANS = [
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
async function getUserSubscriptionPlan(user) {
    const isSubscribed = Boolean(user.stripePriceId &&
        user.stripeCurrentPeriodEnd && // 86400000 = 1 day
        user.stripeCurrentPeriodEnd.getTime() + 86400000 > Date.now());
    const plan = isSubscribed
        ? exports.PLANS.find((plan) => plan.price.priceIds.test === user.stripePriceId)
        : null;
    let isCanceled = false;
    if (isSubscribed && user.stripeSubscriptionId) {
        const stripePlan = await stripe_1.stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        isCanceled = stripePlan.cancel_at_period_end;
    }
    return {
        ...plan,
        stripeSubscriptionId: user.stripeSubscriptionId,
        stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
        stripeCustomerId: user.stripeCustomerId,
        isSubscribed,
        isCanceled,
    };
}
