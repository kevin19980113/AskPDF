"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.pollingFile = exports.getFile = exports.getAllFiles = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const uploadthing_1 = require("../lib/uploadthing");
const getAllFiles = async (req, res) => {
    try {
        const { userId: requestUserID } = req.params;
        const userId = req.user.id;
        if (requestUserID !== userId)
            return res.status(401).json({ error: "Unauthorized user" });
        const files = await prisma_1.default.file.findMany({
            where: { userId },
        });
        return res.status(200).json(files);
    }
    catch (error) {
        console.log("Error in getAllFiles:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getAllFiles = getAllFiles;
const getFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.id;
        const file = await prisma_1.default.file.findUnique({
            where: { id: fileId },
        });
        if (!file)
            return res.status(404).json({ error: "File not found" });
        if (file.userId !== userId)
            return res.status(401).json({ error: "Unauthorized user" });
        return res.status(200).json(file);
    }
    catch (error) {
        console.log("Error in getFile:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getFile = getFile;
const pollingFile = async (req, res) => {
    try {
        const key = req.params.fileKey;
        const userId = req.user.id;
        const file = await prisma_1.default.file.findFirst({
            where: { key, userId },
        });
        if (!file)
            return res.status(404).json({ error: "File not found" });
        return res.status(200).json(file);
    }
    catch (error) {
        console.log("Error in pollingFile:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.pollingFile = pollingFile;
const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.id;
        const file = await prisma_1.default.file.findUnique({
            where: { id: fileId },
        });
        if (!file)
            return res.status(404).json({ error: "File not found" });
        if (file.userId !== userId)
            return res.status(401).json({ error: "Unauthorized user" });
        const deleteFile = await prisma_1.default.file.delete({ where: { id: fileId } });
        await uploadthing_1.utapi.deleteFiles(deleteFile.key);
        return res.status(200).json(file);
    }
    catch (error) {
        console.log("Error in deleteFile:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.deleteFile = deleteFile;
