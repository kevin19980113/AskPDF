"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = exports.utapi = void 0;
const express_1 = require("uploadthing/express");
const prisma_1 = __importDefault(require("../db/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("uploadthing/server");
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const pinecone_1 = require("./pinecone");
const openai_1 = require("@langchain/openai");
const pinecone_2 = require("@langchain/pinecone");
exports.utapi = new server_1.UTApi();
const f = (0, express_1.createUploadthing)();
exports.uploadRouter = {
    pdfUploader: f({
        pdf: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    })
        .middleware(async ({ req }) => {
        const authHeader = req.headers["authorization"];
        if (!authHeader?.startsWith("Bearer "))
            throw new Error("Unauthorized");
        const accessToken = authHeader.split(" ")[1];
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(accessToken, process.env.JWT_ACCESSTOKEN_SECRET, async (err, decoded) => {
                if (err)
                    reject(new Error("Unauthorized"));
                const decodedToken = decoded;
                const user = await prisma_1.default.user.findUnique({
                    where: { id: decodedToken.userId },
                });
                if (!user)
                    reject(new Error("Unauthorized"));
                resolve({ userId: user.id });
            });
        });
    })
        .onUploadComplete(async ({ metadata, file }) => {
        const createdFile = await prisma_1.default.file.create({
            data: {
                key: file.key,
                name: file.name,
                userId: metadata.userId,
                url: file.url,
                uploadStatus: "PROCESSING",
            },
        });
        try {
            // 1. get pdf from uploadthing
            const res = await fetch(file.url);
            const blob = await res.blob();
            const loader = new pdf_1.PDFLoader(blob);
            // 2. load pdf into langchain
            const docs = await loader.load();
            const pagesAmt = docs.length;
            // 3. vectorize and index entire document
            const { pineconeIndex } = await (0, pinecone_1.getPineconeClient)();
            const embeddings = new openai_1.OpenAIEmbeddings({
                openAIApiKey: process.env.OPENAI_API_KEY,
            });
            await pinecone_2.PineconeStore.fromDocuments(docs, embeddings, {
                pineconeIndex,
                namespace: createdFile.id,
            });
            await prisma_1.default.file.update({
                where: { id: createdFile.id },
                data: { uploadStatus: "SUCCESS" },
            });
        }
        catch (error) {
            await prisma_1.default.file.update({
                where: { id: createdFile.id },
                data: { uploadStatus: "FAILED" },
            });
        }
    }),
};
