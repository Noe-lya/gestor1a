import express from "express";

import {connectAuto} from "./../config/db/connect.config.js";
import {initPassport} from "./../config/auth/passport.config.js";

import logger from "./../middleware/logger.middleware.js";

import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import passport from "passport";
import cookieParser from "cookie-parser"; //Parsea la clave secreta

import {initRouters} from "./../routes/router.js";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 8001;
const SECRET_SESSION = process.env.SECRET_SESSION;

app.use(express.json());
app.use(logger);
app.use(cookieParser(SECRET_SESSION));

export const startServer = async () => {
  await connectAuto();

  const store = MongoStore.create({
    client: (await import("mongoose")).default.connection.getClient(),
    ttl: 60 * 60,
  });

  //Generamos la cookie
  app.use(
    session({
      secret: SECRET_SESSION,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        maxAge: 1 * 60 * 60 * 1000,
        httpOnly: true,
        signed: true,
      },
    }),
  );

  initPassport();
  app.use(passport.initialize());
  app.use(passport.session());

  initRouters(app);

  app.use((req, res) => {
    res.status(404).json({error: "Page not found"});
  });

  app.listen(PORT, () =>
    console.log(`🎧 Servidor escuchando en http://localhost:${PORT}`),
  );
};
