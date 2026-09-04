// Uso: checkRole("admin", "capturista")
// Deja pasar solo si el rol del usuario (puesto por verificarToken) esta en la lista permitida
function checkRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ mensaje: "No autenticado" });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: "No tienes permiso para realizar esta accion" });
    }

    next();
  };
}

module.exports = checkRole;
