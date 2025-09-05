import express from "express";
import { finishText, getLeaderboard, getText } from "./textController.ts";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("backend is running");
});

app.get("/text", getText);
app.post("/finish", finishText);
app.get("/leaderboard", getLeaderboard);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
