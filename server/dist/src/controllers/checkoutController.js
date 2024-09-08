"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSubscriptionPlanInfo = exports.createCheckoutSession = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const getUserSubscriptionPlan_1 = require("../utils/getUserSubscriptionPlan");
const stripe_1 = require("../lib/stripe");
const absoluteUrl_1 = require("../utils/absoluteUrl");
const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized user" });
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const { isSubscribed, isCanceled } = await (0, getUserSubscriptionPlan_1.getUserSubscriptionPlan)(user);
        const billingUrl = (0, absoluteUrl_1.absoluteUrl)("/dashboard/billing");
        const cancel_url = (0, absoluteUrl_1.absoluteUrl)("/pricing");
        if (isSubscribed && user.stripeCustomerId) {
            const stripeSession = await stripe_1.stripe.billingPortal.sessions.create({
                customer: user.stripeCustomerId,
                return_url: billingUrl,
            });
            return res.status(200).json({ url: stripeSession.url });
        }
        const stripeSession = await stripe_1.stripe.checkout.sessions.create({
            success_url: billingUrl,
            cancel_url: cancel_url,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            line_items: [
                {
                    price: getUserSubscriptionPlan_1.PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: userId,
            },
        });
        return res.status(200).json({ url: stripeSession.url });
    }
    catch (error) {
        console.log("Error in createCheckoutSession:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.createCheckoutSession = createCheckoutSession;
const getUserSubscriptionPlanInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized user" });
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const subscriptionPlan = await (0, getUserSubscriptionPlan_1.getUserSubscriptionPlan)(user);
        return res.status(200).json(subscriptionPlan);
    }
    catch (error) {
        console.log("Error in getUserSubscriptionPlanInfo:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getUserSubscriptionPlanInfo = getUserSubscriptionPlanInfo;
