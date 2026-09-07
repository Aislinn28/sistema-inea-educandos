const express = require("express");
const router = express.Router();

const {
  crearUsuario,
  listarUsuarios,
  editarUsuario,
  cambiarEstatusUsuario,
  login,
  solicitarRecuperacion,
  restablecerPassword,
} = require("../controllers/authController");
const verificarToken = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");

// Login: publico
router.post("/login", login);

// Recuperacion de contrasena: publico
router.post("/recuperar", solicitarRecuperacion);
router.post("/restablecer/:token", restablecerPassword);

// Gestion de usuarios: solo el administrador
router.get("/usuarios", verificarToken, checkRole("admin"), listarUsuarios);
router.post("/usuarios", verificarToken, checkRole("admin"), crearUsuario);
router.put("/usuarios/:id", verificarToken, checkRole("admin"), editarUsuario);
router.patch("/usuarios/:id/estatus", verificarToken, checkRole("admin"), cambiarEstatusUsuario);

module.exports = router;