import { Request, Response } from "express";
import prisma from "../db/prisma";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import jwt from "jsonwebtoken";
import { DecodedToken } from "../middleware/protectRoute";

export const signup = async (req: Request, res: Response) => {
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
        error:
          "Password must include at least one capital letter, one small letter, and one special character.",
      });

    const user = await prisma.user.findUnique({ where: { username } });
    if (user)
      return res.status(400).json({ error: "Username already exists." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    if (newUser) return res.status(201).json({ message: "Sign up Successful" });

    return res
      .status(400)
      .json({ error: "An error occurred while signing up." });
  } catch (error: any) {
    console.log("Error in signup controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) return res.status(401).json({ error: "No existing username" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect password" });

    const accessToken = generateAccessToken(user.id);
    await generateRefreshToken(user.id, res);

    return res.json({
      username,
      accessToken,
    });
  } catch (error: any) {
    console.log("Error in login controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies.jwt) return res.sendStatus(204);

    const refreshToken = cookies.jwt;

    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) {
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax",
      });
      return res.sendStatus(204);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
    });

    return res.status(200).json({ username: user.username });
  } catch (error: any) {
    console.log("Error in logout controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      id: user.id,
      username: user.username,
    });
  } catch (error: any) {
    console.log("Error in getMe controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const refresh = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies.jwt)
      return res.status(401).json({ error: "No Refresh Token" });

    const refreshToken = cookies.jwt;

    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) return res.status(401).json({ error: "Invalid Refresh Token" });

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESHTOKEN_SECRET!,
      (
        err: jwt.VerifyErrors | null,
        decoded: string | jwt.JwtPayload | undefined
      ) => {
        const decodedToken = decoded as DecodedToken;
        if (err || decodedToken.userId !== user.id)
          return res.status(401).json({ error: "Invalid Refresh Token" });

        const newAccessToken = generateAccessToken(user.id);

        return res.status(200).json({ accessToken: newAccessToken });
      }
    );
  } catch (error: any) {
    console.log("Error in refresh controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
