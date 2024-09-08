import express from "express";
import {
  deleteFile,
  getAllFiles,
  getFile,
  pollingFile,
} from "../controllers/fileController";
import protectRoute from "../middleware/protectRoute";

const fileRoutes = express.Router();

fileRoutes.get("/all/:userId", protectRoute, getAllFiles);
fileRoutes.get("/:fileId", protectRoute, getFile);
fileRoutes.post("/delete/:fileId", protectRoute, deleteFile);
fileRoutes.get("/polling/:fileKey", protectRoute, pollingFile);

export default fileRoutes;
