import {Router} from "express";
import {User} from "../config/models/user.model.js";
import bcrypt from "bcrypt";
import {requireJwtCookie} from "../middleware/auth.middleware.js";
import jwt from "jsonwebtoken";

const router = new Router();

router.post("/login", async (req, res) => {
  const {email, password} = req.body;
  if (!email) {
    return res
      .status(400)
      .json({error: "Invalid Credentials - email does not exist"});
  }
  const u = await User.findOne({email}); //Valido que existe el usuario
  if (!u || !u.password) {
    return res.status(400).json({error: "Invalid Credentials"});
  }

  const ok = await bcrypt.compare(password, u.password);
  if (!ok) return res.status(400).json({error: "Invalid Credentials"});

  const payload = {sub: String(u._id), email: u.email, role: u.role};
  const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});

  //Cookie HttpOnly
  res.cookie("access_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, //se setea como true cuando es https != httpOnly
    maxAge: 60 * 60 * 1000,
    path: "/",
  });

  res
    .status(200)
    .json({message: "Session JWT login successfully", user: u, token});
});

router.get("/me", requireJwtCookie, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({error: "User not found"});
    const {first_name, last_name, email, role, age} = req.user;
    res.status(200).json({
      message: "User found successfully",
      user: {first_name, last_name, email, role, age},
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

export default router;
