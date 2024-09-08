import { createUploadthing, type FileRouter } from "uploadthing/express";
import prisma from "../db/prisma";
import jwt from "jsonwebtoken";
import { DecodedToken } from "../middleware/protectRoute";
import { UTApi } from "uploadthing/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { getPineconeClient } from "./pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import {
  getUserSubscriptionPlan,
  PLANS,
  SubscriptionPlanType,
} from "../utils/getUserSubscriptionPlan";
import { Request } from "express";

export const utapi = new UTApi();

const f = createUploadthing();

const middleware = async ({ req }: { req: Request }) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

  const accessToken = authHeader.split(" ")[1];

  return new Promise<{
    subscriptionPlan: SubscriptionPlanType;
    userId: string;
  }>((resolve, reject) => {
    jwt.verify(
      accessToken,
      process.env.JWT_ACCESSTOKEN_SECRET!,
      async (err, decoded) => {
        if (err) reject(new Error("Unauthorized"));

        const decodedToken = decoded as DecodedToken;
        const user = await prisma.user.findUnique({
          where: { id: decodedToken.userId },
        });
        if (!user) reject(new Error("Unauthorized"));

        const subscriptionPlan = await getUserSubscriptionPlan(user!);

        resolve({ subscriptionPlan, userId: user!.id });
      }
    );
  });
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  const createdFile = await prisma.file.create({
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

    const loader = new PDFLoader(blob);

    // 2. load pdf into langchain
    const docs = await loader.load();

    // plan pageperpdf check
    const pagesAmt = docs.length;
    const { subscriptionPlan } = metadata;
    const { isSubscribed } = subscriptionPlan;

    const isProExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
    const isFreeExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await prisma.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });
      return;
    }

    // 3. vectorize and index entire document
    const { pineconeIndex } = await getPineconeClient();

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
    });

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
    });

    await prisma.file.update({
      where: { id: createdFile.id },
      data: { uploadStatus: "SUCCESS" },
    });
  } catch (error: any) {
    await prisma.file.update({
      where: { id: createdFile.id },
      data: { uploadStatus: "FAILED" },
    });
  }
};

export const uploadRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
