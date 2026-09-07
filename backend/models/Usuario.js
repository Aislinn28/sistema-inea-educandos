const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "El formato del correo no es valido"],
    },
    password_hash: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: ["admin", "capturista", "lectura"],
      required: true,
      default: "lectura",
    },
    activo: {
      type: Boolean,
      default: true,
    },
    intentos_fallidos: {
      type: Number,
      default: 0,
    },
    bloqueado_hasta: {
      type: Date,
      default: null,
    },
    reset_password_token: {
      type: String,
      default: null,
    },
    reset_password_expira: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automaticamente
  }
);

module.exports = mongoose.model("Usuario", usuarioSchema);