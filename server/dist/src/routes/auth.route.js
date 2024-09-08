"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const loginLimiter_1 = __importDefault(require("../middleware/loginLimiter"));
const authController_1 = require("../controllers/authController");
const protectRoute_1 = __importDefault(require("../middleware/protectRoute"));
const authRoutes = express_1.default.Router();
authRoutes.post("/signup", authController_1.signup);
authRoutes.post("/login", loginLimiter_1.default, authController_1.login);
authRoutes.post("/logout", authController_1.logout);
authRoutes.get("/refresh", authController_1.refresh);
authRoutes.get("/me", protectRoute_1.default, authController_1.getMe);
exports.default = authRoutes;
