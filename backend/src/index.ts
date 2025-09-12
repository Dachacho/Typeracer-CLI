import app from "../app.ts";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import prisma from "./utils/prismaClient.ts";
import logger from "./utils/logger.ts";
import { setIo } from "./controllers/roomController.ts";

dotenv.config();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

setIo(io);

const port = process.env.PORT || 3000;

io.on("connection", (socket) => {
  logger.info(`user connected: ${socket.id}`);

  socket.on("joinRoom", async (roomId, username) => {
    socket.join(`room-${roomId}`);
    socket.to(`room-${roomId}`).emit("userJoined", { username });

    const count = await prisma.participant.count({ where: { roomId } });
    io.to(`room-${roomId}`).emit("participantCount", { count });
  });

  socket.on("startRace", (roomId) => {
    let count = 3;
    const interval = setInterval(() => {
      if (count > 0) {
        io.to(`room-${roomId}`).emit("countdown", count);
        count--;
      } else {
        clearInterval(interval);
        io.to(`room-${roomId}`).emit("raceStarted");
      }
    }, 1000);
  });
});

httpServer.listen(port, () => {
  logger.info(`server running on ${port}`);
});

export { io };
