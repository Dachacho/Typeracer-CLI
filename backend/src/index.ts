import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import textRouter from "./routes/textRouter.ts";
import roomRouter from "./routes/roomRouter.ts";
import prisma from "./utils/prismaClient.ts";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config();

const app = express();

try {
  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Typeracer API",
        version: "1.0.0",
      },
    },
    apis: ["./src/routes/*.ts"],
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} catch (err) {
  console.error("failed: ", err);
}
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

io.on("connection", (socket) => {
  console.log("user conneted: ", socket.id);

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
    // io.to(`room-${roomId}`).emit("raceStarted");
  });

  // socket.on("finishRace", (roomId, username, wpm, accuracy) => {
  //   io.to(`room-${roomId}`).emit("raceFinished", { username, wpm, accuracy });
  // });
});

app.use(textRouter);
app.use(roomRouter);

// app.get("/", (req, res) => {
//   res.send("backend is running");
// });

httpServer.listen(port, () => {
  console.log(`server running on ${port}`);
});

// app.listen(port, () => {
//   console.log(`server is running on port ${port}`);
// });
export { io };
