const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Usuario = require("../models/Usuario");
const { enviarCorreoRecuperacion } = require("../config/mailer");

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;

// Solo el administrador da de alta correos de capturistas / solo lectura (ver requisito de roles)
async function crearUsuario(req, res) {
  try {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password || !rol) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const existe = await Usuario.findOne({ correo });
    if (existe) {
      return res.status(409).json({ mensaje: "Ya existe un usuario con ese correo" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      password_hash,
      rol,
    });

    return res.status(201).json({
      mensaje: "Usuario creado correctamente",
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        activo: nuevoUsuario.activo,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: "Ya existe un usuario con ese correo" });
    }
    return res.status(500).json({ mensaje: "Error al crear el usuario", error: error.message });
  }
}

// Lista todos los usuarios (solo admin). No se envia password_hash ni tokens.
async function listarUsuarios(req, res) {
  try {
    const usuarios = await Usuario.find()
      .select("nombre correo rol activo createdAt")
      .sort({ createdAt: -1 });
    return res.json(usuarios);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener los usuarios", error: error.message });
  }
}

// Edita nombre, correo o rol de un usuario existente (solo admin)
async function editarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre, correo, rol } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { nombre, correo, rol },
      { new: true, runValidators: true }
    ).select("nombre correo rol activo");

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    return res.json({ mensaje: "Usuario actualizado correctamente", usuario });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: "Ya existe un usuario con ese correo" });
    }
    return res.status(500).json({ mensaje: "Error al actualizar el usuario", error: error.message });
  }
}

// Baja logica: el usuario deja de poder iniciar sesion pero no se borra (requisito de auditoria)
async function cambiarEstatusUsuario(req, res) {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (String(id) === String(req.usuario.id) && activo === false) {
      return res.status(400).json({ mensaje: "No puedes dar de baja tu propia cuenta" });
    }

    const usuario = await Usuario.findByIdAndUpdate(id, { activo: !!activo }, { new: true }).select(
      "nombre correo rol activo"
    );

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    return res.json({
      mensaje: usuario.activo ? "Usuario reactivado correctamente" : "Usuario dado de baja correctamente",
      usuario,
    });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al actualizar el estatus del usuario", error: error.message });
  }
}

async function login(req, res) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ mensaje: "Correo y contrasena son obligatorios" });
    }

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales invalidas" });
    }

    if (usuario.activo === false) {
      return res.status(403).json({ mensaje: "Esta cuenta esta dada de baja. Contacta al administrador" });
    }

    // Revisa si el usuario esta bloqueado por intentos fallidos (requisito 15)
    if (usuario.bloqueado_hasta && usuario.bloqueado_hasta > new Date()) {
      return res.status(423).json({
        mensaje: `Cuenta bloqueada temporalmente. Intenta despues de ${usuario.bloqueado_hasta.toLocaleTimeString()}`,
      });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      usuario.intentos_fallidos += 1;

      if (usuario.intentos_fallidos >= MAX_INTENTOS) {
        usuario.bloqueado_hasta = new Date(Date.now() + MINUTOS_BLOQUEO * 60 * 1000);
        usuario.intentos_fallidos = 0;
      }

      await usuario.save();
      return res.status(401).json({ mensaje: "Credenciales invalidas" });
    }

    // Login correcto: reinicia contador de intentos fallidos
    usuario.intentos_fallidos = 0;
    usuario.bloqueado_hasta = null;
    await usuario.save();

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    return res.json({
      mensaje: "Inicio de sesion exitoso",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al iniciar sesion", error: error.message });
  }
}

// Paso 1: el usuario pide el enlace de recuperacion
async function solicitarRecuperacion(req, res) {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ mensaje: "El correo es obligatorio" });
    }

    const usuario = await Usuario.findOne({ correo });

    // Por seguridad, respondemos igual exista o no el correo (no revelamos si esta registrado)
    if (!usuario) {
      return res.json({
        mensaje: "Si el correo esta registrado, recibiras un enlace de recuperacion",
      });
    }

    // Genera un token aleatorio, guarda su version hasheada, y expira en 30 minutos
    const tokenPlano = crypto.randomBytes(32).toString("hex");
    const tokenHasheado = crypto.createHash("sha256").update(tokenPlano).digest("hex");

    usuario.reset_password_token = tokenHasheado;
    usuario.reset_password_expira = new Date(Date.now() + 30 * 60 * 1000);
    await usuario.save();

    const enlace = `${process.env.FRONTEND_URL}/restablecer-password/${tokenPlano}`;
    await enviarCorreoRecuperacion(usuario.correo, enlace);

    return res.json({
      mensaje: "Si el correo esta registrado, recibiras un enlace de recuperacion",
    });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al procesar la solicitud", error: error.message });
  }
}

// Paso 2: el usuario da clic en el enlace y manda su nueva contrasena
async function restablecerPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ mensaje: "La contraseña debe tener al menos 8 caracteres" });
    }

    const tokenHasheado = crypto.createHash("sha256").update(token).digest("hex");

    const usuario = await Usuario.findOne({
      reset_password_token: tokenHasheado,
      reset_password_expira: { $gt: new Date() }, // que no haya expirado
    });

    if (!usuario) {
      return res.status(400).json({ mensaje: "El enlace es invalido o ya expiro" });
    }

    usuario.password_hash = await bcrypt.hash(password, 10);
    usuario.reset_password_token = null;
    usuario.reset_password_expira = null;
    usuario.intentos_fallidos = 0;
    usuario.bloqueado_hasta = null;
    await usuario.save();

    return res.json({ mensaje: "Contraseña actualizada correctamente, ya puedes iniciar sesion" });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al restablecer la contraseña", error: error.message });
  }
}

module.exports = {
  crearUsuario,
  listarUsuarios,
  editarUsuario,
  cambiarEstatusUsuario,
  login,
  solicitarRecuperacion,
  restablecerPassword,
};