import { Request, Response } from "express";
import prisma from "../db/prisma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { getPineconeClient } from "../lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { openai } from "../lib/openai";
import { streamText } from "ai";

const INFINITE_QUERY_LIMIT = 10;

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { fileId, message } = req.body;
    const userId = req.user.id;

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });
    if (!file) return res.status(404).json({ error: "File not found" });

    await prisma.message.create({
      data: {
        text: message,
        isUserMessage: true,
        userId,
        fileId,
      },
    });

    // 1. vectorize message
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
    });
    const { pineconeIndex } = await getPineconeClient();

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
    });

    // 2. find similar contents from existing index to provide to AI
    const similaritySearchResults = await vectorStore.similaritySearch(
      message,
      4
    );

    const prevMessages = await prisma.message.findMany({
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
      role: message.isUserMessage ? ("user" as const) : ("assistant" as const),
      content: message.text,
    }));

    // 4. generate AI response
    const { textStream } = await streamText({
      model: openai("gpt-3.5-turbo"),
      system:
        "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
      prompt: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.

    \n----------------\n

    PREVIOUS CONVERSATION:
    ${formattedPrevMessages.map((message) => {
      if (message.role === "user") return `User: ${message.content}\n`;
      return `Assistant: ${message.content}\n`;
    })}

    \n----------------\n

    CONTEXT:
    ${similaritySearchResults.map((doc) => doc.pageContent).join("\n\n")}

    USER INPUT: ${message}`,
      temperature: 0,
      onFinish: async (completion) => {
        await prisma.message.create({
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
  } catch (error: any) {
    console.log("Error in sendMessage controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const fileId = req.query.fileId as string;
    const cursor = req.query.cursor as string | undefined;

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });
    if (!file) return res.status(404).json({ error: "File not found" });

    const messages = await prisma.message.findMany({
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

    let nextCursor: typeof cursor | undefined = undefined;

    if (messages.length > INFINITE_QUERY_LIMIT) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }

    return res.status(200).json({ messages, nextCursor });
  } catch (error: any) {
    console.log("Error in getMessages controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
