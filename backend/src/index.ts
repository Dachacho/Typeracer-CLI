import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import textRouter from "./routes/textRouter.ts";
import roomRouter from "./routes/roomRouter.ts";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use(textRouter);
app.use(roomRouter);

app.get("/", (req, res) => {
  res.send("backend is running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
