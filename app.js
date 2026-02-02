import express from "express";
import {
  connectMongoDB,
  connectMongoAtlasDB,
} from "./config/db/connect.config.js";
import homeRouter from "./routes/home.router.js";
import studentRouter from "./routes/student.router.js";
import logger from "./middleware/logger.middleware.js";

const app = express();
const PORT = 8000;
const ATLAS = false;

app.use(express.json());
app.use(logger);
app.use("/", homeRouter);
app.use("/student", studentRouter);

const startServer = async () => {
  ATLAS ? connectMongoAtlasDB() : connectMongoDB();
  app.listen(PORT, () =>
    console.log(`🎧 Servidor escuchando en http://localhost:${PORT}`),
  );
};

await startServer();
