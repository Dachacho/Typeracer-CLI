import express from "express";
import router from "./routes/textRouter.ts";

const app = express();
const port = 3000;

app.use(express.json());

app.use(router);

app.get("/", (req, res) => {
  res.send("backend is running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
