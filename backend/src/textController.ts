import prisma from "./prismaClient.ts";
import type { Request, Response } from "express";

export const getText = async (req: Request, res: Response) => {
  try {
    const texts = await prisma.text.findMany();
    res.json(texts);
  } catch (ex) {
    console.log(ex);
    res.status(500).json({ message: (ex as Error).message });
  }
};

export const finishText = async (req: Request, res: Response) => {};

export const getLeaderboard = async (req: Request, res: Response) => {};
