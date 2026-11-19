// Envia correos por la API HTTPS de Brevo (puerto 443).
// Render (plan gratis) bloquea los puertos SMTP 25, 465 y 587, por eso Nodemailer
// con Gmail ya no funciona en produccion. No necesita instalar nada: usa el fetch de Node.
//
// Variables de entorno necesarias:
//   BREVO_API_KEY    -> clave de la API de Brevo
//   EMAIL_FROM       -> correo remitente, verificado en Brevo (Settings > Senders)
//   EMAIL_FROM_NAME  -> (opcional) nombre que aparece como remitente
//   FRONTEND_URL     -> de aqui se toma la direccion publica del banner
//   EMAIL_BANNER_URL -> (opcional) si quieres alojar el banner en otro lugar

const COLOR_GUINDA = "#671235";
const MINUTOS_VIGENCIA = 30;

function escapar(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// La API de Brevo no admite imagenes incrustadas (cid), asi que el banner se carga
// desde una URL publica: el archivo vive en frontend/public/encabezado-correo.jpg
function urlDelBanner() {
  return (
    process.env.EMAIL_BANNER_URL ||
    `${(process.env.FRONTEND_URL || "").replace(/\/$/, "")}/encabezado-correo.jpg`
  );
}

// Cuerpo del correo de recuperación (HTML con tablas y estilos en línea para que se vea
// bien en Gmail, Outlook y celulares)
function construirHtmlRecuperacion(enlace) {
  const url = escapar(enlace);
  const banner = escapar(urlDelBanner());
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>Recuperación de contraseña</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F6F3;">
  <!-- Texto de vista previa (se ve junto al asunto en la bandeja de entrada) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Usa este enlace para elegir una nueva contraseña. Es válido por ${MINUTOS_VIGENCIA} minutos.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F3F6F3;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          style="width:100%;max-width:600px;background-color:#FFFFFF;border:1px solid #E2E8E3;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">

          <!-- Banner institucional -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <img src="${banner}" width="600" alt="Secretaría de Educación Pública · Instituto Nacional para la Educación de los Adultos"
                style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding:32px 36px 8px 36px;">
              <h1 style="margin:0 0 16px 0;font-size:22px;line-height:28px;color:#14201A;font-weight:bold;">
                Recuperación de contraseña
              </h1>
              <p style="margin:0 0 12px 0;font-size:15px;line-height:23px;color:#3E4C44;">Hola,</p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:23px;color:#3E4C44;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en
                <strong>SIGESE-INEA</strong>, el Sistema de Gestión y Seguimiento de Expedientes.
              </p>
            </td>
          </tr>

          <!-- Botón -->
          <tr>
            <td align="center" style="padding:0 36px 8px 36px;">
              <a href="${url}" target="_blank"
                style="display:inline-block;background-color:${COLOR_GUINDA};color:#FFFFFF;text-decoration:none;font-size:16px;font-weight:bold;line-height:20px;padding:14px 32px;border-radius:8px;">
                Restablecer contraseña
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:12px 36px 24px 36px;">
              <p style="margin:0;font-size:13px;line-height:19px;color:#5F6C64;">
                Este enlace es válido por <strong>${MINUTOS_VIGENCIA} minutos</strong>.
              </p>
            </td>
          </tr>

          <!-- Enlace alterno -->
          <tr>
            <td style="padding:0 36px 24px 36px;">
              <p style="margin:0 0 6px 0;font-size:13px;line-height:19px;color:#5F6C64;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0;font-size:12px;line-height:18px;color:${COLOR_GUINDA};word-break:break-all;">
                <a href="${url}" target="_blank" style="color:${COLOR_GUINDA};text-decoration:underline;">${url}</a>
              </p>
            </td>
          </tr>

          <!-- Aviso de seguridad -->
          <tr>
            <td style="padding:0 36px 32px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#F3F6F3;border-radius:8px;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;line-height:20px;color:#3E4C44;">
                    <strong>¿No fuiste tú?</strong> Puedes ignorar este correo; tu contraseña seguirá
                    siendo la misma y nadie podrá cambiarla sin este enlace.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td style="padding:0 36px;">
              <div style="height:3px;line-height:3px;font-size:0;background-color:${COLOR_GUINDA};">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px 28px 36px;font-size:12px;line-height:18px;color:#5F6C64;">
              <strong style="color:#3E4C44;">Instituto Nacional para la Educación de los Adultos</strong><br />
              Calle Purísima Concepción S/N, 1a Cabecera, Municipio de San Felipe del Progreso,
              Estado de México, C.P. 50640<br />
              Tel: (712) 1235714 · czsanfelipedelprogreso@inea.gob.mx<br />
              <span style="color:#8A958E;">Este es un mensaje automático de SIGESE-INEA.</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Versión en texto plano (para clientes de correo que no muestran HTML)
function construirTextoRecuperacion(enlace) {
  return [
    "Recuperación de contraseña - SIGESE-INEA",
    "",
    "Recibimos una solicitud para restablecer la contraseña de tu cuenta.",
    `Abre este enlace (válido por ${MINUTOS_VIGENCIA} minutos):`,
    enlace,
    "",
    "Si no fuiste tú, ignora este correo: tu contraseña seguirá siendo la misma.",
    "",
    "Instituto Nacional para la Educación de los Adultos",
    "Tel: (712) 1235714 · czsanfelipedelprogreso@inea.gob.mx",
  ].join("\n");
}

async function enviarCorreoRecuperacion(destinatario, enlace) {
  const nombreRemitente = process.env.EMAIL_FROM_NAME || "SIGESE-INEA";

  const respuesta = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: nombreRemitente,
        email: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: [{ email: destinatario }],
      subject: "Recuperación de contraseña - SIGESE-INEA",
      textContent: construirTextoRecuperacion(enlace),
      htmlContent: construirHtmlRecuperacion(enlace),
    }),
    // Si Brevo no responde en 10 segundos, falla rapido en vez de quedarse colgado
    signal: AbortSignal.timeout(10000),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`Brevo respondio ${respuesta.status}: ${detalle}`);
  }
}

module.exports = { enviarCorreoRecuperacion };