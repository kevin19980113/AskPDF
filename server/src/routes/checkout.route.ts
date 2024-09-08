import express from "express";
import {
  createCheckoutSession,
  getUserSubscriptionPlanInfo,
} from "../controllers/checkoutController";
import protectRoute from "../middleware/protectRoute";

const checkoutRoutes = express.Router();

checkoutRoutes.get("/create-session", protectRoute, createCheckoutSession);
checkoutRoutes.get(
  "/get-user-subscription-plan",
  protectRoute,
  getUserSubscriptionPlanInfo
);

export default checkoutRoutes;
