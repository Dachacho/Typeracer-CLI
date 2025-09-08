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

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const { roomId, username } = req.body;

    if (!roomId || username) {
      res.status(400).json({ message: "username and roomId are needed" });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: "room not found" });
    }

    const existing = await prisma.participant.findFirst({
      where: { roomId, username },
    });

    if (existing) {
      return res.status(400).json({ message: "user already joined" });
    }

    const participant = await prisma.participant.create({
      data: { roomId, username },
    });

    return res.json(participant);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const startRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      res.status(400).json({ message: "roomId is needed" });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: "room not found" });
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { status: "started" },
    });

    res.json(updatedRoom);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
