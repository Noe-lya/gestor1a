import {Router} from "express";
import {User} from "../config/models/user.model.js";
import bcrypt from "bcrypt";
import {
  requireLogin,
  alreadyLogin,
  requireJWT,
} from "../middleware/auth.middleware.js";

import jwt from "jsonwebtoken";
import passport from "passport";

const router = new Router();

/*Registro de usuario local (hash con bcrypt) */
router.post("/register", alreadyLogin, async (req, res) => {
  try {
    const {first_name, last_name, email, password, age} = req.body;
    if (!first_name || !last_name || !email || !password || !age) {
      res.status(400).json({error: "Todos los datos son requeridos"});
    }

    const exist = await User.findOne({email});
    if (exist)
      return res
        .status(400)
        .json({error: `El email ${email} ya está registrado por otro usuario`});

    const hash = await bcrypt.hash(password, 10);
    const user = new User({first_name, last_name, email, password: hash, age});
    await user.save();
    res.status(201).json({message: "Usuario registrado con éxito", user: user});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

router.post("/login", alreadyLogin, async (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) return next(error);
    if (!user)
      return res
        .status(401)
        .json({error: `User ${user} does not exist. ` + error.message});
    req.logIn(user, {session: true}, (err) => {
      if (err) return next(err);
      req.session.user = user;
      return res
        .status(200)
        .json({message: "Session login successfully", user: user});
    });
  })(req, res, next);
});

router.post("/logout", requireLogin, async (req, res, next) => {
  //Evita que passport regenere la sesión
  req.logout({keepSessionInfo: true}, (error) => {
    if (error) return next(error);

    //Ahora destruimos la sesión
    if (req.session) {
      req.session.destroy((err) => {
        if (err) return next(err);
        //Limpia la cookie de session (por defecto 'connect.sid')
        res.clearCookie("connect.sid");
        return res.status(200).json({message: "Session logout successfully"});
      });
    }
  });
});

router.get("/me", requireLogin, (req, res) => {
  res.status(200).json({user: req.session.user});
});

//Strategy de GitHub
router.get("/github", passport.authenticate("github", {scope: ["user:email"]}));
router.get(
  "/github/callback",
  passport.authenticate("github", {failureRedirect: "/api/github/fail"}),
  (req, res) => {
    req.session.user = req.user;
    res
      .status(200)
      .json({message: "Session GitHub login successfully", user: req.user});
  },
);
router.get("/github/fail", (req, res) => {
  res.status(401).json({error: "Failed to login to GitHub"});
});

//JWT
router.post("/jwt/login", async (req, res) => {
  const {email, password} = req.body;
  const u = await User.findOne({email}); //Valido que existe el usuario
  if (!u || !u.password) {
    return res.status(400).json({message: "Invalid Credentials"});
  }
  const ok = await bcrypt.compare(password, u.password);
  if (!ok) return res.status(400).json({message: "Invalid Credentials"});

  const payload = {sub: String(u._id), email: u.email, role: u.role};
  const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});
  res
    .status(200)
    .json({message: "Session JWT login successfully", user: u, token});
});

router.get("/jwt/me", requireJWT, async (req, res) => {
  const u = await User.findById(req.jwt.sub).lean();
  if (!u) return res.status(404).json({error: "User not found"});
  const {first_name, last_name, email, role, age} = u;
  const token = req.headers.authorization?.replace("Bearer ", "") || "";
  res
    .status(200)
    .json({user: {first_name, last_name, email, role, age}, token});
});

export default router;
