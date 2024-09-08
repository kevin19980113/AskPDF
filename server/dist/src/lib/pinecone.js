"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPineconeClient = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const node_fetch_1 = __importDefault(require("node-fetch"));
const getPineconeClient = async () => {
    const pinecone = new pinecone_1.Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
        fetchApi: node_fetch_1.default,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    return { pinecone, pineconeIndex };
};
exports.getPineconeClient = getPineconeClient;
