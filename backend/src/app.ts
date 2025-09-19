import express from "express";
import textRouter from "./routes/textRouter.ts";
import roomRouter from "./routes/roomRouter.ts";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import cors from "cors";
import { erorrHandler } from "./middleware/errorHandler.ts";

const app = express();
app.use(cors());
app.use(express.json());

const swaggerDocument = yaml.load("./src/docs/swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(textRouter);
app.use(roomRouter);

app.use(erorrHandler);

export default app;
