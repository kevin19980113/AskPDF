"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkoutController_1 = require("../controllers/checkoutController");
const protectRoute_1 = __importDefault(require("../middleware/protectRoute"));
const checkoutRoutes = express_1.default.Router();
checkoutRoutes.get("/create-session", protectRoute_1.default, checkoutController_1.createCheckoutSession);
checkoutRoutes.get("/get-user-subscription-plan", protectRoute_1.default, checkoutController_1.getUserSubscriptionPlanInfo);
exports.default = checkoutRoutes;
