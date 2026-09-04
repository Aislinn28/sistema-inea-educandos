require("dotenv").config();
const express = require("express");
const cors = require("cors");
const conectarDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const educandoRoutes = require("./routes/educandoRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reporteRoutes = require("./routes/reporteRoutes");
const historialRoutes = require("./routes/historialRoutes");

const app = express();

// Middlewares generales
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Ruta de prueba para confirmar que el servidor esta vivo
app.get("/api/health", (req, res) => {
  res.json({ estado: "ok", mensaje: "API del sistema INEA funcionando" });
});

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/educandos", educandoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/historial", historialRoutes);

// Manejador simple de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 4000;

// Primero conectamos a la base de datos, y solo si funciona levantamos el servidor
conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});
