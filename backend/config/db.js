const mongoose = require("mongoose");

// Se conecta a MongoDB Atlas usando la cadena guardada en .env
async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conexion a MongoDB Atlas exitosa");
  } catch (error) {
    console.error("Error al conectar con MongoDB Atlas:", error.message);
    // Si no hay conexion a la BD, no tiene sentido que el servidor siga corriendo
    process.exit(1);
  }
}

module.exports = conectarDB;
