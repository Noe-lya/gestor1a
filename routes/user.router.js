import {Router} from "express";
import {User} from "../config/models/user.model.js";
import bcrypt from "bcrypt";
import {requireLogin, alreadyLogin} from "../middleware/auth.middleware.js";

const router = new Router();

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

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({users: users});
  } catch (error) {
    res.status(500).json({error: error.mesagge});
  }
});

router.post("/login", alreadyLogin, async (req, res) => {
  try {
    const {email, password} = req.body;
    if (!email || !password) {
      res.status(400).json({error: "Todos los datos son requeridos"});
    }
    const user = await User.findOne({email});
    if (!user)
      return res.status(400).json({
        error: `El email ${email} no corresponde a un usuario existente`,
      });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({error: `Credenciales inválidas`});

    req.session.user = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };
    res.status(200).json({message: "¡Login existoso!", user: req.session.user});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

router.post("/logout", requireLogin, async (req, res) => {
  try {
    const {first_name, last_name} = req.session.user;
    const full_name = first_name + " " + last_name;
    req.session.destroy((error) => {
      if (error) {
        return res
          .status(500)
          .json({message: "Error al hacer logout", error: error.message});
        res.clearCookie("connect.sid", {path: "/"});
        res.status(200).json({message: "¡Logout existoso!", byebye: full_name});
      }
    });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

export default router;
