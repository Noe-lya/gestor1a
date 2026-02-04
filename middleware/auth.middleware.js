import jwt from "jsonwebtoken";

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

//Autorizacion por roles

export function requireRoles(role) {
  return (req, res, next) => {
    const user = req.session?.user || req.user; //Valida que haya sesion
    if (!user) return res.status(401).json({error: "Not Authorized"}); //Valida que exista ese usuario
    if (user.role !== role) res.status(403).json({error: "Forbbiden access"}); //Valida que los roles del usuario concuerden con el rol del parámetro
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
