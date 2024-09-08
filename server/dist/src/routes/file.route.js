"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileController_1 = require("../controllers/fileController");
const protectRoute_1 = __importDefault(require("../middleware/protectRoute"));
const fileRoutes = express_1.default.Router();
fileRoutes.get("/all/:userId", protectRoute_1.default, fileController_1.getAllFiles);
fileRoutes.get("/:fileId", protectRoute_1.default, fileController_1.getFile);
fileRoutes.post("/delete/:fileId", protectRoute_1.default, fileController_1.deleteFile);
fileRoutes.get("/polling/:fileKey", protectRoute_1.default, fileController_1.pollingFile);
exports.default = fileRoutes;
