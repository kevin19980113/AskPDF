import jwt from "jsonwebtoken";
import { Response } from "express";
import prisma from "../db/prisma";

export const generateAccessToken = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESSTOKEN_SECRET!,
    {
      expiresIn: "1h",
    }
  );

  return accessToken;
};

export const generateRefreshToken = async (userId: string, res: Response) => {
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESHTOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
  });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
