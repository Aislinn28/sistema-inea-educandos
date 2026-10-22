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
    apellido_paterno: {
      type: String,
      required: [true, "El apellido paterno es obligatorio"],
      trim: true,
    },
    apellido_materno: {
      type: String,
      trim: true,
      default: "",
    },
    nombres: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    // Se genera automaticamente como "Apellido Apellido Nombres" (orden de archivero fisico)
    nombre: {
      type: String,
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
      enum: ["Inicial", "Primaria", "Secundaria"], // ajusta a los niveles reales del INEA
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

function componerNombre(apellido_paterno, apellido_materno, nombres) {
  return [apellido_paterno, apellido_materno, nombres]
    .map((parte) => (parte || "").trim())
    .filter(Boolean)
    .join(" ");
}

educandoSchema.pre("save", function (next) {
  this.nombre = componerNombre(this.apellido_paterno, this.apellido_materno, this.nombres);
  next();
});

educandoSchema.pre("findOneAndUpdate", function (next) {
  const cambios = this.getUpdate();
  if (cambios.apellido_paterno || cambios.apellido_materno || cambios.nombres) {
    cambios.nombre = componerNombre(
      cambios.apellido_paterno ?? this._update.$set?.apellido_paterno,
      cambios.apellido_materno ?? this._update.$set?.apellido_materno,
      cambios.nombres ?? this._update.$set?.nombres
    );
  }
  next();
});

module.exports = mongoose.model("Educando", educandoSchema);
