import express from "express";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("backend is running");
});

app.listen(port, () => {
  console.log(`server is running on port${port}`);
});
