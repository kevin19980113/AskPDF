import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import fileRoutes from "./routes/file.route";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./lib/uploadthing";
import messageRoutes from "./routes/message.route";
import checkoutRoutes from "./routes/checkout.route";
import cors from "cors";
import stripeWebhookRouter from "./webhook/stripe_webhook";

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(
  cors({
    origin: process.env.PRODUCTION_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use("/webhook/stripe", stripeWebhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/message", messageRoutes);
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: { isDev: false },
  })
);
app.use("/api/checkout", checkoutRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
