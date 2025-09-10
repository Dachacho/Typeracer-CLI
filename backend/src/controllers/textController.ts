import prisma from "../utils/prismaClient.ts";
import type { Request, Response } from "express";
import compare from "../utils/util.ts";

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
    return res.status(500).json({ message: (ex as Error).message });
  }
};

export const finishText = async (req: Request, res: Response) => {
  try {
    const { username, textId, timeTaken, userInput } = req.body;

    if (!username || !textId) {
      res.status(400).json({ message: "server error" });
      return;
    }

    const originalText = await prisma.text.findUnique({
      where: { id: textId },
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
        textId,
        wpm,
        accuracy,
        timeTaken,
      },
    });

    res.json(result);
  } catch (ex) {
    console.log(ex);
    return res.status(500).json({ message: (ex as Error).message });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaderboard = await prisma.result.findMany({
      orderBy: [{ wpm: "desc" }, { accuracy: "desc" }],
    });
    res.json(leaderboard);
  } catch (ex) {
    console.log(ex);
    return res.status(500).json({ message: (ex as Error).message });
  }
};
