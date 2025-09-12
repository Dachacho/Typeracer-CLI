import prisma from "../utils/prismaClient.ts";
import type { Request, Response } from "express";
import compare from "../utils/util.ts";
import { io } from "../index.ts";

export const createRoom = async (req: Request, res: Response) => {
  try {
    const count = await prisma.text.count();
    if (count === 0) {
      return res.status(404).json({ message: "No texts available" });
    }

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

    res.status(201).json(room);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const { roomId, username } = req.body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ message: "invalid username" });
    }

    if (!roomId) {
      return res.status(400).json({ message: "roomId is needed" });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: "room not found" });
    }

    if (room.status !== "waiting") {
      return res
        .status(400)
        .json({ message: "cannot join room already started" });
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

    return res.status(201).json(participant);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const startRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: "roomId is needed" });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: "room not found" });
    }

    if (room.status === "started") {
      return res.status(400).json({ message: "room already started" });
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { status: "started" },
    });

    res.status(201).json(updatedRoom);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const finishRoom = async (req: Request, res: Response) => {
  try {
    const { username, roomId, userInput, timeTaken } = req.body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ message: "invalid username" });
    }

    if (!roomId || !userInput || !timeTaken) {
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

    const existingResult = await prisma.result.findFirst({
      where: { roomId, username },
    });

    if (existingResult) {
      return res.status(400).json({ message: "result already submitted" });
    }

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

    const participantCount = await prisma.participant.count({
      where: { roomId },
    });
    const resultCount = await prisma.result.count({ where: { roomId } });

    if (participantCount === resultCount) {
      const results = await prisma.result.findMany({ where: { roomId } });
      io.to(`room-${roomId}`).emit("raceFinished", results);

      await prisma.result.deleteMany({ where: { roomId } });
      await prisma.participant.deleteMany({ where: { roomId } });
      await prisma.room.delete({ where: { id: roomId } });
    }

    res.status(201).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const getRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany();
    res.status(201).json(rooms);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: (err as Error).message });
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
      include: { text: true, participants: true },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(201).json(room);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const getRoomLeaderboard = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).json({ message: "provide roomId" });
    }
    const numericRoomId = Number(roomId);
    if (isNaN(numericRoomId)) {
      return res.status(400).json({ message: "roomId must be a number" });
    }

    const results = await prisma.result.findMany({
      where: { roomId: numericRoomId },
      orderBy: [{ wpm: "desc" }, { accuracy: "desc" }],
    });

    if (results.length === 0) {
      return res.status(404).json({ message: "No results for this room yet" });
    }

    res.json(results);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: (err as Error).message });
  }
};
