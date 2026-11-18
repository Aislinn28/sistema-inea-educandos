
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

// ========================================
// CONFIGURACIÓN CORS
// ========================================

const origenesPermitidos = [
  "https://educandos-inea.vercel.app",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: origenesPermitidos,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// ========================================
// MIDDLEWARES GENERALES
// ========================================

app.use(express.json());

// ========================================
// RUTA DE PRUEBA
// ========================================

app.get("/api/health", (req, res) => {
  res.json({
    estado: "ok",
    mensaje: "API del sistema INEA funcionando",
  });
});

// ========================================
// RUTAS PRINCIPALES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/educandos", educandoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/historial", historialRoutes);

// ========================================
// RUTAS NO ENCONTRADAS
// ========================================

app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada",
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

const PORT = process.env.PORT || 4000;

conectarDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log("Orígenes CORS permitidos:", origenesPermitidos);
    });
  })
  .catch((error) => {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  });
