const express = require("express");
const router = express.Router();

const { exportarExcel, exportarPdf, exportarGraficasPdf } = require("../controllers/reporteController");
const verificarToken = require("../middlewares/auth");

// Los 3 roles pueden exportar, incluido "lectura" (asi lo definimos)
router.get("/excel", verificarToken, exportarExcel);
router.get("/pdf", verificarToken, exportarPdf);
router.get("/graficas-pdf", verificarToken, exportarGraficasPdf);

module.exports = router;
