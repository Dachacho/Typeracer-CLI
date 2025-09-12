import express from "express";
import textRouter from "./src/routes/textRouter.ts";
import roomRouter from "./src/routes/roomRouter.ts";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const swaggerDocument = yaml.load("./src/docs/swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(textRouter);
app.use(roomRouter);

export default app;
