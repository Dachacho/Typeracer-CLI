import express from "express";
import dotenv from "dotenv";
import router from "./routes/textRouter.ts";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(router);

app.get("/", (req, res) => {
  res.send("backend is running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
