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
      },
    });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al crear el usuario", error: error.message });
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
      return res.status(400).json({ mensaje: "La contrasena debe tener al menos 8 caracteres" });
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

    return res.json({ mensaje: "Contrasena actualizada correctamente, ya puedes iniciar sesion" });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al restablecer la contrasena", error: error.message });
  }
}

module.exports = { crearUsuario, login, solicitarRecuperacion, restablecerPassword };
