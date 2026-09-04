const express = require("express");
const router = express.Router();

const { estadisticas } = require("../controllers/dashboardController");
const verificarToken = require("../middlewares/auth");

// Los 3 roles pueden ver el dashboard (incluido "lectura")
router.get("/estadisticas", verificarToken, estadisticas);

module.exports = router;
