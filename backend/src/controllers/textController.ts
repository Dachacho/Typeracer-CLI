import prisma from "../utils/prismaClient.ts";
import type { Request, Response } from "express";
import compare from "../utils/util.ts";
import logger from "../utils/logger.ts";

export const getText = async (req: Request, res: Response) => {
  try {
    const count = await prisma.text.count();
    const randomIndex = Math.floor(Math.random() * count);
    const randomText = await prisma.text.findFirst({
      skip: randomIndex,
    });

    logger.info("random text served");
    res.status(200).json(randomText);
  } catch (err) {
    logger.error(`getText error: ${(err as Error).message}`);
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const finishText = async (req: Request, res: Response) => {
  try {
    const { username, textId, timeTaken, userInput } = req.body;

    if (!username || !textId || !userInput || !timeTaken) {
      logger.warn("missing required fields in finishText");
      return res.status(400).json({ message: "server error" });
    }

    const originalText = await prisma.text.findUnique({
      where: { id: textId },
    });

    if (!originalText) {
      logger.warn(`text ${textId} not found in finishText`);
      return res.status(404).json({ message: "Text not found" });
    }

    const wordsTyped = userInput.trim().split(/\s+/).length;
    const accuracy = compare(originalText.content, userInput);
    const minutes = timeTaken / 60;
    const wpm = wordsTyped / minutes;

    const result = await prisma.result.create({
      data: {
        username,
        textId,
        wpm,
        accuracy,
        timeTaken,
      },
    });

    logger.info(`result saved for user ${username} on text ${textId}`);
    res.status(201).json(result);
  } catch (err) {
    logger.error(`finishText error: ${(err as Error).message}`);
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaderboard = await prisma.result.findMany({
      orderBy: [{ wpm: "desc" }, { accuracy: "desc" }],
    });

    logger.info("leaderboard served");
    res.status(200).json(leaderboard);
  } catch (err) {
    logger.error(`getLeaderboard error: ${(err as Error).message}`);
    return res.status(500).json({ message: (err as Error).message });
  }
};
