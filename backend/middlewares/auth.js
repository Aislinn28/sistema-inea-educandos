const jwt = require("jsonwebtoken");

// Verifica el token, ya sea en el header Authorization (uso normal con Axios)
// o como query param ?token=... (necesario para los <a href> de descarga de
// reportes, ya que un enlace normal no puede mandar headers personalizados).
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ mensaje: "No se proporciono un token de acceso" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token invalido o expirado" });
  }
}

module.exports = verificarToken;
