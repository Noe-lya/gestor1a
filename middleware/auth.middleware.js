import jwt from "jsonwebtoken";
import passport from "passport";

export function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({error: "Not Authorized"});
  }
  next();
}

export function alreadyLogin(req, res, next) {
  if (req.session.user) {
    return res.status(403).json({error: "You are already logued"});
  }
  next();
}

//Autorizacion por rol

export function requireRole(role) {
  return (req, res, next) => {
    const user = req.session?.user || req.user; //Valida que haya sesion
    if (!user) return res.status(401).json({error: "Not Authorized"}); //Valida que exista ese usuario
    if (user.role !== role) res.status(403).json({error: "Forbbiden access"}); //Valida que los roles del usuario concuerden con el rol del parámetro
    next();
  };
}

//Require passport-jwt leyendo la cookie de access_token
export const requireJwtCookie = passport.authenticate("jwt-cookie", {
  session: false,
});

//Autorizacion por roles

export function requireManyRoles(...role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({error: "Not Authorized"}); //Valida que exista ese usuario
    if (!roles.includes(req.user.role))
      res.status(403).json({error: "Forbbiden access"}); //Valida que los roles del usuario concuerden con el array de roles del spread (...roles)
    next();
  };
}

export function requireJWT(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token)
    return res.status(401).json({error: "Not Authorized", token: "Not exists"});
  try {
    req.jwt = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Not Authorized, " + error.message,
      token: "Invalid token",
    });
  }
}
