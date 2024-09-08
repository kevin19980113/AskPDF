"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../db/prisma"));
const generateAccessToken = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_ACCESSTOKEN_SECRET, {
        expiresIn: "1h",
    });
    return accessToken;
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = async (userId, res) => {
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESHTOKEN_SECRET, {
        expiresIn: "7d",
    });
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { refreshToken },
    });
    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};
exports.generateRefreshToken = generateRefreshToken;
