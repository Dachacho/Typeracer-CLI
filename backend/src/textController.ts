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

export const finishText = async (req: Request, res: Response) => {
  const { username, textId, timeTaken, userInput } = req.body;

  const originalText = await prisma.text.findFirst(textId);
};

export const getLeaderboard = async (req: Request, res: Response) => {};

function compare(original: string, input: string) {
  const originalArr = original.split("");
  const inputArr = input.split("");

  let correct = 0;
  for (let i = 0; i < originalArr.length; i++) {
    if (inputArr[i] === originalArr[i]) {
      correct++;
    }
  }

  const accuracy = correct / originalArr.length;
  return accuracy;
}
