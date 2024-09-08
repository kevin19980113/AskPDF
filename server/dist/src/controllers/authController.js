"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.getMe = exports.logout = exports.login = exports.signup = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = require("../utils/generateToken");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signup = async (req, res) => {
    try {
        const { username, password, confirmPassword } = req.body;
        if (!username || !password || !confirmPassword)
            return res.status(400).json({ error: "Please fill in all fields." });
        if (password.length < 8)
            return res
                .status(400)
                .json({ error: "Password must be at least 8 characters long." });
        if (password !== confirmPassword)
            return res.status(400).json({ error: "Passwords do not match." });
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
        if (!passwordRegex.test(password))
            return res.status(400).json({
                error: "Password must include at least one capital letter, one small letter, and one special character.",
            });
        const user = await prisma_1.default.user.findUnique({ where: { username } });
        if (user)
            return res.status(400).json({ error: "Username already exists." });
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const newUser = await prisma_1.default.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        });
        if (newUser)
            return res.status(201).json({ message: "Sign up Successful" });
        return res
            .status(400)
            .json({ error: "An error occurred while signing up." });
    }
    catch (error) {
        console.log("Error in signup controller:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { username } });
        if (!user)
            return res.status(401).json({ error: "No existing username" });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: "Incorrect password" });
        const accessToken = (0, generateToken_1.generateAccessToken)(user.id);
        await (0, generateToken_1.generateRefreshToken)(user.id, res);
        return res.json({
            username,
            accessToken,
        });
    }
    catch (error) {
        console.log("Error in login controller:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies.jwt)
            return res.sendStatus(204);
        const refreshToken = cookies.jwt;
        const user = await prisma_1.default.user.findFirst({ where: { refreshToken } });
        if (!user) {
            res.clearCookie("jwt", {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                sameSite: "lax",
            });
            return res.sendStatus(204);
        }
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { refreshToken: null },
        });
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "lax",
        });
        return res.status(200).json({ username: user.username });
    }
    catch (error) {
        console.log("Error in logout controller:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.status(200).json({
            id: user.id,
            username: user.username,
        });
    }
    catch (error) {
        console.log("Error in getMe controller:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getMe = getMe;
const refresh = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies.jwt)
            return res.status(401).json({ error: "No Refresh Token" });
        const refreshToken = cookies.jwt;
        const user = await prisma_1.default.user.findFirst({ where: { refreshToken } });
        if (!user)
            return res.status(401).json({ error: "Invalid Refresh Token" });
        jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESHTOKEN_SECRET, (err, decoded) => {
            const decodedToken = decoded;
            if (err || decodedToken.userId !== user.id)
                return res.status(401).json({ error: "Invalid Refresh Token" });
            const newAccessToken = (0, generateToken_1.generateAccessToken)(user.id);
            return res.status(200).json({ accessToken: newAccessToken });
        });
    }
    catch (error) {
        console.log("Error in refresh controller:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.refresh = refresh;
