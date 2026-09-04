const Educando = require("../models/Educando");
const HistorialAuditoria = require("../models/HistorialAuditoria");
const cloudinary = require("../config/cloudinary");

// Crea un educando y registra la accion en el historial (requisito 8)
async function crearEducando(req, res) {
  try {
    const { nombre, rfe, fecha_registro, nivel } = req.body;

    const nuevoEducando = await Educando.create({
      nombre,
      rfe,
      fecha_registro,
      nivel,
      creado_por: req.usuario.id,
    });

    await HistorialAuditoria.create({
      id_educando: nuevoEducando._id,
      id_usuario: req.usuario.id,
      accion: "crear",
      detalle: `Educando ${nuevoEducando.nombre} (RFE: ${nuevoEducando.rfe}) creado`,
    });

    return res.status(201).json({ mensaje: "Educando registrado correctamente", educando: nuevoEducando });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: "Ya existe un educando con ese RFE" });
    }
    return res.status(500).json({ mensaje: "Error al registrar el educando", error: error.message });
  }
}

// Lista educandos activos, con busqueda por RFE y filtro por nivel (requisitos 4 y 5)
async function listarEducandos(req, res) {
  try {
    const { rfe, nivel } = req.query;
    const filtro = { estatus: "activo" };

    if (rfe) filtro.rfe = new RegExp(rfe, "i");
    if (nivel) filtro.nivel = nivel;

    const educandos = await Educando.find(filtro).sort({ fecha_registro: -1 });
    return res.json(educandos);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener los educandos", error: error.message });
  }
}

async function editarEducando(req, res) {
  try {
    const { id } = req.params;
    const cambios = req.body;

    const educando = await Educando.findByIdAndUpdate(id, cambios, { new: true, runValidators: true });

    if (!educando) {
      return res.status(404).json({ mensaje: "Educando no encontrado" });
    }

    await HistorialAuditoria.create({
      id_educando: educando._id,
      id_usuario: req.usuario.id,
      accion: "editar",
      detalle: `Educando ${educando.nombre} (RFE: ${educando.rfe}) editado`,
    });

    return res.json({ mensaje: "Educando actualizado correctamente", educando });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al actualizar el educando", error: error.message });
  }
}

// Borrado logico: solo marca como inactivo (requisito 10)
async function eliminarEducando(req, res) {
  try {
    const { id } = req.params;

    const educando = await Educando.findByIdAndUpdate(id, { estatus: "inactivo" }, { new: true });

    if (!educando) {
      return res.status(404).json({ mensaje: "Educando no encontrado" });
    }

    await HistorialAuditoria.create({
      id_educando: educando._id,
      id_usuario: req.usuario.id,
      accion: "eliminar",
      detalle: `Educando ${educando.nombre} (RFE: ${educando.rfe}) marcado como inactivo`,
    });

    return res.json({ mensaje: "Educando dado de baja correctamente" });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al dar de baja el educando", error: error.message });
  }
}

// Cloudinary exige un tipo especifico (image, video o raw) para poder eliminar
// un archivo despues; "auto" solo sirve para subir, no para destruir.
function determinarResourceType(mimetype) {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "raw"; // PDFs, Word, Excel, etc.
}

// Sube uno o varios documentos y los agrega al arreglo embebido del educando (requisito 1)
async function subirDocumentos(req, res) {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ mensaje: "No se recibio ningun archivo" });
    }

    const educando = await Educando.findById(id);
    if (!educando) {
      return res.status(404).json({ mensaje: "Educando no encontrado" });
    }

    const nuevosDocumentos = req.files.map((archivo) => ({
      nombre_archivo: archivo.originalname,
      url_cloudinary: archivo.path, // multer-storage-cloudinary pone la URL en "path"
      public_id: archivo.filename, // y el public_id en "filename"
      resource_type: determinarResourceType(archivo.mimetype),
    }));

    educando.documentos.push(...nuevosDocumentos);
    await educando.save();

    await HistorialAuditoria.create({
      id_educando: educando._id,
      id_usuario: req.usuario.id,
      accion: "editar",
      detalle: `Se agregaron ${nuevosDocumentos.length} documento(s) al educando ${educando.nombre}`,
    });

    return res.status(201).json({ mensaje: "Documentos subidos correctamente", documentos: educando.documentos });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al subir los documentos", error: error.message });
  }
}

// Elimina un documento especifico del educando (tanto en Cloudinary como en la BD)
async function eliminarDocumento(req, res) {
  try {
    const { id, idDocumento } = req.params;

    const educando = await Educando.findById(id);
    if (!educando) {
      return res.status(404).json({ mensaje: "Educando no encontrado" });
    }

    const documento = educando.documentos.id(idDocumento);
    if (!documento) {
      return res.status(404).json({ mensaje: "Documento no encontrado" });
    }

    await cloudinary.uploader.destroy(documento.public_id, {
      resource_type: documento.resource_type || "raw",
    });
    documento.deleteOne();
    await educando.save();

    return res.json({ mensaje: "Documento eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al eliminar el documento", error: error.message });
  }
}

module.exports = {
  crearEducando,
  listarEducandos,
  editarEducando,
  eliminarEducando,
  subirDocumentos,
  eliminarDocumento,
};
