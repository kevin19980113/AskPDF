import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import fetch from "node-fetch";

export const getPineconeClient = async () => {
  const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY!,
    fetchApi: fetch as any,
  });
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

  return { pinecone, pineconeIndex };
};
