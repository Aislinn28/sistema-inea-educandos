const Educando = require("../models/Educando");

// Letra de la "hoja" a la que pertenece un educando (inicial del apellido paterno, sin acento).
function letraInicial(apellido) {
  const c = (apellido || "").trim().charAt(0).toUpperCase();
  if (c === "Ñ") return "Ñ";
  const base = c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /^[A-Z]$/.test(base) ? base : "#";
}

// Todos los educandos (activos y bajas) en orden alfabetico, cada uno con su "letra" y su
// "numero" (consecutivo entre los ACTIVOS de esa letra; null si esta de baja).
async function obtenerEducandosNumerados() {
  const todos = await Educando.find()
    .sort({ apellido_paterno: 1, apellido_materno: 1, nombres: 1, _id: 1 })
    .collation({ locale: "es", strength: 1 })
    .lean();

  const contadores = {};
  return todos.map((e) => {
    const letra = letraInicial(e.apellido_paterno);
    let numero = null;
    if (e.estatus === "activo") {
      contadores[letra] = (contadores[letra] || 0) + 1;
      numero = contadores[letra];
    }
    return { ...e, letra, numero };
  });
}

module.exports = { letraInicial, obtenerEducandosNumerados };
