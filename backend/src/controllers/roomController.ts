import prisma from "../utils/prismaClient.ts";
import type { Request, Response } from "express";
import compare from "../utils/util.ts";

export const createRoom = async (req: Request, res: Response) => {
  const count = await prisma.text.count();
  const randomIndex = Math.floor(Math.random() * count);
  const randomText = await prisma.text.findFirst({
    skip: randomIndex,
  });
};
