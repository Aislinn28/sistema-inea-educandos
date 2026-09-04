const express = require("express");
const router = express.Router();

const {
  crearEducando,
  listarEducandos,
  editarEducando,
  eliminarEducando,
  subirDocumentos,
  eliminarDocumento,
} = require("../controllers/educandoController");
const verificarToken = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");
const upload = require("../middlewares/upload");

// Todas las rutas de aqui para abajo requieren estar autenticado
router.use(verificarToken);

// Los 3 roles pueden ver la lista (solo lectura incluido)
router.get("/", listarEducandos);

// Solo admin y capturista pueden crear, editar o dar de baja
router.post("/", checkRole("admin", "capturista"), crearEducando);
router.put("/:id", checkRole("admin", "capturista"), editarEducando);
router.delete("/:id", checkRole("admin", "capturista"), eliminarEducando);

// Subir documentos: campo "documentos" en form-data, puede ser multiple
router.post(
  "/:id/documentos",
  checkRole("admin", "capturista"),
  upload.array("documentos", 5),
  subirDocumentos
);

router.delete(
  "/:id/documentos/:idDocumento",
  checkRole("admin", "capturista"),
  eliminarDocumento
);

module.exports = router;
