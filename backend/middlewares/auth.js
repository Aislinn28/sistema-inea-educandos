const jwt = require("jsonwebtoken");

// Verifica que la peticion traiga un token valido en el header Authorization
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "No se proporciono un token de acceso" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, rol, nombre }
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token invalido o expirado" });
  }
}

module.exports = verificarToken;
