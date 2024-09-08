"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const protectRoute_1 = __importDefault(require("../middleware/protectRoute"));
const messageRoutes = express_1.default.Router();
messageRoutes.post("/send", protectRoute_1.default, messageController_1.sendMessage);
messageRoutes.get("/get", protectRoute_1.default, messageController_1.getMessages);
exports.default = messageRoutes;
