import prisma from "./prismaClient.ts";
import type { Request, Response } from "express";

export const getText = async (req: Request, res: Response) => {
  try {
    const count = await prisma.text.count();
    const randomIndex = Math.floor(Math.random() * count);
    const randomText = await prisma.text.findFirst({
      skip: randomIndex,
    });
    res.json(randomText);
  } catch (ex) {
    console.log(ex);
    res.status(500).json({ message: (ex as Error).message });
  }
};

export const finishText = async (req: Request, res: Response) => {};

export const getLeaderboard = async (req: Request, res: Response) => {};
