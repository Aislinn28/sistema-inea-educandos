const express = require("express");
const router = express.Router();

const { crearUsuario, login, solicitarRecuperacion, restablecerPassword } = require("../controllers/authController");
const verificarToken = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");

// Login: publico
router.post("/login", login);

// Recuperacion de contrasena: publico
router.post("/recuperar", solicitarRecuperacion);
router.post("/restablecer/:token", restablecerPassword);

// Crear usuario: solo el administrador puede dar de alta correos (capturista/lectura)
router.post("/usuarios", verificarToken, checkRole("admin"), crearUsuario);

module.exports = router;
