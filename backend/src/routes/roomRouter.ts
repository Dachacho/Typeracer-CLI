import { Router } from "express";
import {
  createRoom,
  joinRoom,
  startRoom,
  finishRoom,
  getRooms,
  getRoom,
  getRoomLeaderboard,
  getRoomUsers,
} from "../controllers/roomController.ts";

const router = Router();

router.post("/room", createRoom);
router.post("/room/join", joinRoom);
router.post("/room/start", startRoom);
router.post("/room/finish", finishRoom);
router.get("/rooms", getRooms);
router.get("/room/:roomId", getRoom);
router.get("/room/:roomId/leaderboard", getRoomLeaderboard);
router.get("/room/:roomId/users", getRoomUsers);

export default router;
