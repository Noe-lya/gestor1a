export const polices =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({error: "Not Authorized"}); //Valida que exista ese usuario
    if (!roles.includes(req.user.role))
      res.status(403).json({error: "Forbbiden access"}); //Valida que los roles del usuario concuerden con el array de roles del spread (...roles)
    next();
  };
