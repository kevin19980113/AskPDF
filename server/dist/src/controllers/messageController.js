"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.sendMessage = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const openai_1 = require("@langchain/openai");
const pinecone_1 = require("../lib/pinecone");
const pinecone_2 = require("@langchain/pinecone");
const openai_2 = require("../lib/openai");
const ai_1 = require("ai");
const INFINITE_QUERY_LIMIT = 10;
const sendMessage = async (req, res) => {
    try {
        const { fileId, message } = req.body;
        const userId = req.user.id;
        const file = await prisma_1.default.file.findFirst({
            where: {
                id: fileId,
                userId,
            },
        });
        if (!file)
            return res.status(404).json({ error: "File not found" });
        await prisma_1.default.message.create({
            data: {
                text: message,
                isUserMessage: true,
                userId,
                fileId,
            },
        });
        // 1. vectorize message
        const embeddings = new openai_1.OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
        const { pineconeIndex } = await (0, pinecone_1.getPineconeClient)();
        const vectorStore = await pinecone_2.PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: file.id,
        });
        // 2. find similar contents from existing index to provide to AI
        const similaritySearchResults = await vectorStore.similaritySearch(message, 4);
        const prevMessages = await prisma_1.default.message.findMany({
            where: {
                fileId,
            },
            orderBy: {
                createdAt: "asc",
            },
            take: 6,
        });
        // 3. format previous messages for providing to AI
        const formattedPrevMessages = prevMessages.map((message) => ({
            role: message.isUserMessage ? "user" : "assistant",
            content: message.text,
        }));
        // 4. generate AI response
        const { textStream } = await (0, ai_1.streamText)({
            model: (0, openai_2.openai)("gpt-3.5-turbo"),
            system: "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
            prompt: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.

    \n----------------\n

    PREVIOUS CONVERSATION:
    ${formattedPrevMessages.map((message) => {
                if (message.role === "user")
                    return `User: ${message.content}\n`;
                return `Assistant: ${message.content}\n`;
            })}

    \n----------------\n

    CONTEXT:
    ${similaritySearchResults.map((doc) => doc.pageContent).join("\n\n")}

    USER INPUT: ${message}`,
            temperature: 0,
            onFinish: async (completion) => {
                await prisma_1.default.message.create({
                    data: {
                        text: completion.text,
                        isUserMessage: false,
                        userId,
                        fileId,
                    },
                });
            },
        });
        for await (const chunk of textStream) {
            res.write(chunk);
        }
        res.end();
    }
    catch (error) {
        console.log("Error in sendMessage controller:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const fileId = req.query.fileId;
        const cursor = req.query.cursor;
        const file = await prisma_1.default.file.findFirst({
            where: {
                id: fileId,
                userId,
            },
        });
        if (!file)
            return res.status(404).json({ error: "File not found" });
        const messages = await prisma_1.default.message.findMany({
            take: INFINITE_QUERY_LIMIT + 1,
            where: {
                fileId,
            },
            orderBy: { createdAt: "desc" },
            cursor: cursor ? { id: cursor } : undefined,
            select: {
                id: true,
                text: true,
                createdAt: true,
                isUserMessage: true,
            },
        });
        let nextCursor = undefined;
        if (messages.length > INFINITE_QUERY_LIMIT) {
            const nextItem = messages.pop();
            nextCursor = nextItem?.id;
        }
        return res.status(200).json({ messages, nextCursor });
    }
    catch (error) {
        console.log("Error in getMessages controller:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getMessages = getMessages;
