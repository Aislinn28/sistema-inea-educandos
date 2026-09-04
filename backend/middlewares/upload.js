const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Configura donde y como se guardan los archivos que suban los usuarios
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "inea_educandos", // carpeta dentro de tu cuenta de Cloudinary
    resource_type: "auto", // permite PDFs, imagenes, etc.
    // Cloudinary genera un public_id automatico si no se especifica uno
  },
});

// Limite de 10 MB por archivo, ajustalo si lo necesitas
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
