"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const openai_1 = require("@ai-sdk/openai");
exports.openai = (0, openai_1.createOpenAI)({
    compatibility: "strict",
    apiKey: process.env.OPENAI_API_KEY,
});
