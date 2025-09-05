import { Router } from "express";
import {
  finishText,
  getLeaderboard,
  getText,
} from "../controllers/textController.ts";

const router = Router();

router.get("/text", getText);
router.post("/finish", finishText);
router.get("/leaderboard", getLeaderboard);

export default router;
