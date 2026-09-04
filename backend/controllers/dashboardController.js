const Educando = require("../models/Educando");

// Cuenta educandos activos agrupados por nivel
async function obtenerPorNivel() {
  return Educando.aggregate([
    { $match: { estatus: "activo" } },
    { $group: { _id: "$nivel", total: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
}

// Cuenta educandos activos agrupados por mes de registro (ultimos 12 meses)
async function obtenerPorMes() {
  return Educando.aggregate([
    { $match: { estatus: "activo" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$fecha_registro" } },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);
}

async function estadisticas(req, res) {
  try {
    const [porNivel, porMes] = await Promise.all([obtenerPorNivel(), obtenerPorMes()]);

    return res.json({
      porNivel: porNivel.map((n) => ({ nivel: n._id, total: n.total })),
      porMes: porMes.map((m) => ({ mes: m._id, total: m.total })),
    });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener estadisticas", error: error.message });
  }
}

module.exports = { estadisticas, obtenerPorNivel, obtenerPorMes };
