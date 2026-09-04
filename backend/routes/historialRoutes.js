const express = require("express");
const router = express.Router();

const { listarHistorial } = require("../controllers/historialController");
const verificarToken = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");

// Solo el administrador puede ver el historial de auditoria completo
router.get("/", verificarToken, checkRole("admin"), listarHistorial);

module.exports = router;
