const HistorialAuditoria = require("../models/HistorialAuditoria");

// Historial completo, o filtrado por educando (requisito 8)
async function listarHistorial(req, res) {
  try {
    const { id_educando } = req.query;
    const filtro = {};
    if (id_educando) filtro.id_educando = id_educando;

    const historial = await HistorialAuditoria.find(filtro)
      .populate("id_usuario", "nombre correo rol")
      .populate("id_educando", "nombre rfe")
      .sort({ fecha: -1 });

    return res.json(historial);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener el historial", error: error.message });
  }
}

module.exports = { listarHistorial };
