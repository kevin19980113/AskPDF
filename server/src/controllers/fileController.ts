import { Request, Response } from "express";
import prisma from "../db/prisma";
import { utapi } from "../lib/uploadthing";
import { getPineconeClient } from "../lib/pinecone";

export const getAllFiles = async (req: Request, res: Response) => {
  try {
    const { userId: requestUserID } = req.params;
    const userId = req.user.id;

    if (requestUserID !== userId)
      return res.status(401).json({ error: "Unauthorized user" });

    const files = await prisma.file.findMany({
      where: { userId },
    });

    return res.status(200).json(files);
  } catch (error: any) {
    console.log("Error in getAllFiles:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) return res.status(404).json({ error: "File not found" });
    if (file.userId !== userId)
      return res.status(401).json({ error: "Unauthorized user" });

    return res.status(200).json(file);
  } catch (error: any) {
    console.log("Error in getFile:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const pollingFile = async (req: Request, res: Response) => {
  try {
    const key = req.params.fileKey;
    const userId = req.user.id;

    const file = await prisma.file.findFirst({
      where: { key, userId },
    });

    if (!file) return res.status(404).json({ error: "File not found" });

    return res.status(200).json(file);
  } catch (error: any) {
    console.log("Error in pollingFile:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) return res.status(404).json({ error: "File not found" });
    if (file.userId !== userId)
      return res.status(401).json({ error: "Unauthorized user" });

    const deleteFile = await prisma.file.delete({ where: { id: fileId } });

    await utapi.deleteFiles(deleteFile.key);

    return res.status(200).json(file);
  } catch (error: any) {
    console.log("Error in deleteFile:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
