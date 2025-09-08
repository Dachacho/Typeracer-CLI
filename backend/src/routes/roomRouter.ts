import { Router } from "express";
import {
  createRoom,
  joinRoom,
  startRoom,
  finishRoom,
  getRooms,
  getRoom,
} from "../controllers/roomController.ts";

const router = Router();

router.post("/room", createRoom);
router.post("/room/join", joinRoom);
router.post("/room/start", startRoom);
router.post("/room/finish", finishRoom);
router.get("/rooms", getRooms);
router.get("/room/:roomId", getRoom);

export default router;
