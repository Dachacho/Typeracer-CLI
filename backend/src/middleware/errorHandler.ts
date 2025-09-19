import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.ts";

export function erorrHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(`global error: ${err.message || err}`);
  res.status(err.status || 500).json({
    message: err.message || "Internal server Error",
  });
}
