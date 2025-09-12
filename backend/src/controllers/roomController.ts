import prisma from "../utils/prismaClient.ts";
import type { Request, Response } from "express";
import compare from "../utils/util.ts";
import logger from "../utils/logger.ts";

let ioInstance: any = null;
export function setIo(io: any) {
  ioInstance = io;
}

export const createRoom = async (req: Request, res: Response) => {
  try {
    const count = await prisma.text.count();
    if (count === 0) {
      logger.warn("no texts avaliable for room creation");
      return res.status(404).json({ message: "No texts available" });
    }

    const randomIndex = Math.floor(Math.random() * count);
    const randomText = await prisma.text.findFirst({
      skip: randomIndex,
    });

    if (!randomText) {
      logger.error("failed to get random text for room creation");
      return res.status(500).json({ message: "failed to get text" });
    }

    const room = await prisma.room.create({
      data: {
        textId: randomText.id,
        status: "waiting",
      },
    });

    logger.info(`room ${room.id} created`);
    res.status(201).json(room);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const { roomId, username } = req.body;

    if (!username || typeof username !== "string" || !username.trim()) {
      logger.warn("invalid username on joinRoom");
      return res.status(400).json({ message: "invalid username" });
    }

    if (!roomId) {
      logger.warn("no roomId provided on joinRoom");
      return res.status(400).json({ message: "roomId is needed" });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      logger.warn(`room ${roomId} not found on joinRoom`);
      return res.status(404).json({ message: "room not found" });
    }

    if (room.status !== "waiting") {
      logger.warn(`room ${roomId} already started`);
      return res
        .status(400)
        .json({ message: "cannot join room already started" });
    }

    const existing = await prisma.participant.findFirst({
      where: { roomId, username },
    });

    if (existing) {
      logger.warn(`user ${username} already joined`);
      return res.status(400).json({ message: "user already joined" });
    }

    const participant = await prisma.participant.create({
      data: { roomId, username },
    });

    logger.info(`user ${username} joined room ${roomId}`);
    return res.status(201).json(participant);
  } catch (err) {
    console.error(`joinRoom error: ${(err as Error).message}`);
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const startRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      logger.warn("no roomId provided on startRoom");
      return res.status(400).json({ message: "roomId is needed" });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      logger.warn(`room ${roomId} not found on startRoom`);
      return res.status(404).json({ message: "room not found" });
    }

    if (room.status === "started") {
      logger.warn(`room ${roomId} already started`);
      return res.status(400).json({ message: "room already started" });
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { status: "started" },
    });

    logger.info(`room ${roomId} started`);
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
      logger.warn("invalid username on finishRoom");
      return res.status(400).json({ message: "invalid username" });
    }

    if (!roomId || !userInput || !timeTaken) {
      logger.warn("missing required fields on finishRoom");
      return res.status(400).json({ message: "missing required fields" });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      logger.warn(`room ${roomId} not found on finishRoom`);
      return res.status(404).json({ message: "room not found" });
    }

    const originalText = await prisma.text.findUnique({
      where: { id: room.textId },
    });

    if (!originalText) {
      logger.warn(`text ${room.textId} not found on finishRoom`);
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
      logger.warn(
        `user ${username} already submitted result for room ${roomId}`
      );
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
      ioInstance?.to(`room-${roomId}`).emit("raceFinished", results);

      await prisma.participant.deleteMany({ where: { roomId } });
      await prisma.room.delete({ where: { id: roomId } });
      logger.info(`room ${roomId} finished and cleaned up`);
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
    res.status(200).json(rooms);
  } catch (err) {
    console.error(`getRooms error: ${(err as Error).message}`);
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      logger.warn("no roomId provided on getRoom");
      return res.status(400).json({ message: "provide roomId" });
    }

    const numericRoomId = Number(roomId);
    if (isNaN(numericRoomId)) {
      logger.warn("Non-numeric roomId on getRoom");
      return res.status(400).json({ message: "roomId must be a number" });
    }

    const room = await prisma.room.findUnique({
      where: { id: numericRoomId },
      include: { text: true, participants: true },
    });

    if (!room) {
      logger.warn(`Room ${numericRoomId} not found on getRoom`);
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (err) {
    logger.error(`getRoom error: ${(err as Error).message}`);
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const getRoomLeaderboard = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      logger.warn("no roomId provided on getRoomLeaderboard");
      return res.status(400).json({ message: "provide roomId" });
    }
    const numericRoomId = Number(roomId);
    if (isNaN(numericRoomId)) {
      logger.warn("non-numeric roomId on getRoomLeaderboard");
      return res.status(400).json({ message: "roomId must be a number" });
    }

    const results = await prisma.result.findMany({
      where: { roomId: numericRoomId },
      orderBy: [{ wpm: "desc" }, { accuracy: "desc" }],
    });

    if (results.length === 0) {
      logger.warn(`no results for room ${numericRoomId} on getRoomLeaderboard`);
      return res.status(404).json({ message: "No results for this room yet" });
    }

    res.status(200).json(results);
  } catch (err) {
    logger.error(`getRoomLeaderboard error: ${(err as Error).message}`);
    return res.status(500).json({ message: (err as Error).message });
  }
};
