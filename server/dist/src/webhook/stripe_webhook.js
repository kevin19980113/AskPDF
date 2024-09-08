"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripe_1 = require("../lib/stripe");
const prisma_1 = __importDefault(require("../db/prisma"));
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripeWebhookRouter = express_1.default.Router();
stripeWebhookRouter.post("/", express_1.default.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"] || "";
    let event;
    try {
        event = stripe_1.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
    catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`);
        return;
    }
    const session = event.data.object;
    if (!session?.metadata?.userId) {
        return res.status(404).json({ error: "Metadata doesn't include userId" });
    }
    if (event.type === "checkout.session.completed") {
        const subscription = await stripe_1.stripe.subscriptions.retrieve(session.subscription);
        await prisma_1.default.user.update({
            where: {
                id: session.metadata.userId,
            },
            data: {
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer,
                stripePriceId: subscription.items.data[0]?.price.id,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        });
    }
    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe_1.stripe.subscriptions.retrieve(session.subscription);
        await prisma_1.default.user.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                stripePriceId: subscription.items.data[0]?.price.id,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        });
    }
    res.sendStatus(200);
});
exports.default = stripeWebhookRouter;
