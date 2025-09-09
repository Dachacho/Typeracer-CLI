import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import textRouter from "./routes/textRouter.ts";
import roomRouter from "./routes/roomRouter.ts";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

io.on("connection", (socket) => {
  console.log("user conneted: ", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(`room-${roomId}`);
    io.to(`room-${roomId}`).emit("userJoined", socket.id);
  });

  socket.on("startRace", (roomId) => {
    io.to(`room-${roomId}`).emit("raceStarted");
  });

  socket.on("finishRace", (roomId, username, wpm, accuracy) => {
    io.to(`room-${roomId}`).emit("userFinished", { username, wpm, accuracy });
  });
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
