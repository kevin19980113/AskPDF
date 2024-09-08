import { Request, Response } from "express";
import prisma from "../db/prisma";
import {
  PLANS,
  getUserSubscriptionPlan,
} from "../utils/getUserSubscriptionPlan";
import { stripe } from "../lib/stripe";
import { absoluteUrl } from "../utils/absoluteUrl";

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return res.status(404).json({ error: "User not found" });

    const { isSubscribed, isCanceled } = await getUserSubscriptionPlan(user);
    const billingUrl = absoluteUrl("/dashboard/billing");
    const cancel_url = absoluteUrl("/pricing");

    if (isSubscribed && user.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: billingUrl,
      });

      return res.status(200).json({ url: stripeSession.url });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: cancel_url,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
    });

    return res.status(200).json({ url: stripeSession.url });
  } catch (error: any) {
    console.log("Error in createCheckoutSession:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserSubscriptionPlanInfo = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return res.status(404).json({ error: "User not found" });

    const subscriptionPlan = await getUserSubscriptionPlan(user);

    return res.status(200).json(subscriptionPlan);
  } catch (error: any) {
    console.log("Error in getUserSubscriptionPlanInfo:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
