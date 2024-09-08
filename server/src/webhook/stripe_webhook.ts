import express from "express";
import { stripe } from "../lib/stripe";
import Stripe from "stripe";
import prisma from "../db/prisma";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const stripeWebhookRouter = express.Router();

stripeWebhookRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"]!;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error: any) {
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "invoice.payment_succeeded") {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await prisma.user.update({
        where: {
          stripeSubscriptionId: subscription.id,
        },
        data: {
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
    }

    if (!session?.metadata?.userId) {
      return res.status(404).json({ error: "Metadata doesn't include userId" });
    }

    if (event.type === "checkout.session.completed") {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await prisma.user.update({
        where: {
          id: session.metadata.userId,
        },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
    }

    res.sendStatus(200);
  }
);

export default stripeWebhookRouter;
