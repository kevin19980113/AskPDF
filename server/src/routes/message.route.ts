import express from "express";
import { getMessages, sendMessage } from "../controllers/messageController";
import protectRoute from "../middleware/protectRoute";

const messageRoutes = express.Router();

messageRoutes.post("/send", protectRoute, sendMessage);
messageRoutes.get("/get", protectRoute, getMessages);

export default messageRoutes;
