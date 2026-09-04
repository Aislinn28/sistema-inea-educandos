const mongoose = require("mongoose");

const historialSchema = new mongoose.Schema(
  {
    id_educando: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Educando",
      required: true,
    },
    id_usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    accion: {
      type: String,
      enum: ["crear", "editar", "eliminar"],
      required: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    detalle: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: false, // ya tenemos el campo "fecha"
  }
);

module.exports = mongoose.model("HistorialAuditoria", historialSchema);
