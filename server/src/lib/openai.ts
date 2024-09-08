import { createOpenAI } from "@ai-sdk/openai";

export const openai = createOpenAI({
  compatibility: "strict",
  apiKey: process.env.OPENAI_API_KEY!,
});
