const mongoose = require("mongoose");

// Sub-esquema embebido: cada documento subido queda dentro del educando
const documentoSchema = new mongoose.Schema(
  {
    nombre_archivo: { type: String, required: true },
    url_cloudinary: { type: String, required: true },
    public_id: { type: String, required: true },
    resource_type: { type: String, enum: ["image", "video", "raw"], default: "raw" },
    fecha_subida: { type: Date, default: Date.now },
  },
  { _id: true }
);

const educandoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    rfe: {
      type: String,
      required: [true, "El RFE es obligatorio"],
      unique: true, // evita RFE duplicados (requisito 11)
      trim: true,
      uppercase: true,
    },
    fecha_registro: {
      type: Date,
      required: [true, "La fecha de registro es obligatoria"],
    },
    nivel: {
      type: String,
      enum: ["Inicial", "Intermedio", "Avanzado"], // ajusta a los niveles reales del INEA
      required: [true, "El nivel es obligatorio"],
    },
    estatus: {
      type: String,
      enum: ["activo", "inactivo"], // borrado logico (requisito 10)
      default: "activo",
    },
    creado_por: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    documentos: [documentoSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Educando", educandoSchema);
