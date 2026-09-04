const nodemailer = require("nodemailer");

// Transportador de correo. Funciona con Gmail (usando una "contrasena de aplicacion")
// o con cualquier otro proveedor SMTP (Outlook, SendGrid, etc.)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true solo si usas el puerto 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarCorreoRecuperacion(destinatario, enlace) {
  await transporter.sendMail({
    from: `"Sistema INEA - Educandos" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: "Recuperacion de contrasena",
    html: `
      <p>Recibimos una solicitud para restablecer tu contrasena.</p>
      <p>Da clic en el siguiente enlace (valido por 30 minutos):</p>
      <p><a href="${enlace}">${enlace}</a></p>
      <p>Si tu no solicitaste esto, puedes ignorar este correo.</p>
    `,
  });
}

module.exports = { enviarCorreoRecuperacion };
