"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const file_route_1 = __importDefault(require("./routes/file.route"));
const express_2 = require("uploadthing/express");
const uploadthing_1 = require("./lib/uploadthing");
const message_route_1 = __importDefault(require("./routes/message.route"));
const checkout_route_1 = __importDefault(require("./routes/checkout.route"));
const cors_1 = __importDefault(require("cors"));
const stripe_webhook_1 = __importDefault(require("./webhook/stripe_webhook"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3001;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.PRODUCTION_URL || "http://localhost:3000",
    credentials: true,
}));
app.use("/stripe_webhooks", stripe_webhook_1.default);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api/auth", auth_route_1.default);
app.use("/api/files", file_route_1.default);
app.use("/api/message", message_route_1.default);
app.use("/api/uploadthing", (0, express_2.createRouteHandler)({
    router: uploadthing_1.uploadRouter,
    config: {},
}));
app.use("/api/checkout", checkout_route_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
