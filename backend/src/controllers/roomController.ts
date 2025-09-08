import prisma from "../utils/prismaClient.ts";
import type { Request, Response } from "express";
import compare from "../utils/util.ts";

export const createRoom = async (req: Request, res: Response) => {
  try {
    const count = await prisma.text.count();
    const randomIndex = Math.floor(Math.random() * count);
    const randomText = await prisma.text.findFirst({
      skip: randomIndex,
    });

    if (!randomText) {
      return res.status(500).json({ message: "failed to get text" });
    }

    const room = await prisma.room.create({
      data: {
        textId: randomText.id,
        status: "waiting",
      },
    });

    res.json(room);
  } catch (err: any) {
    res.json(500).json({ message: err.message });
  }
};
