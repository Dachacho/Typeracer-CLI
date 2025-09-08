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
  } catch (err) {
    console.log(err);
    res.json(500).json({ message: (err as Error).message });
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
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: (err as Error).message });
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
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: (err as Error).message });
  }
};

export const finishRoom = async (req: Request, res: Response) => {
  try {
    const { username, roomId, userInput, timeTaken } = req.body;

    if (!username || !roomId || !userInput || !timeTaken) {
      return res.status(400).json({ message: "missing required fields" });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: "room not found" });
    }

    const originalText = await prisma.text.findUnique({
      where: { id: room.textId },
    });

    if (!originalText) {
      return res.status(404).json({ message: "Text not found" });
    }

    const wordsTyped = userInput.trim().split(/\s+/).length;
    const accuracy = compare(originalText.content, userInput);
    const minutes = timeTaken / 60;
    const wpm = wordsTyped / minutes;

    const result = await prisma.result.create({
      data: {
        username,
        textId: room.textId,
        roomId,
        wpm,
        accuracy,
        timeTaken,
      },
    });
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: (err as Error).message });
  }
};

export const getRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany();
    res.json(rooms);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: (err as Error).message });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ message: "provide roomId" });
    }

    const numericRoomId = Number(roomId);
    if (isNaN(numericRoomId)) {
      return res.status(400).json({ message: "roomId must be a number" });
    }

    const room = await prisma.room.findUnique({
      where: { id: numericRoomId },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: (err as Error).message });
  }
};
