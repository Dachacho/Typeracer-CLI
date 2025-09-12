import express from "express";
import textRouter from "./src/routes/textRouter.ts";
import roomRouter from "./src/routes/roomRouter.ts";

const app = express();
app.use(express.json());
app.use(textRouter);
app.use(roomRouter);

export default app;
