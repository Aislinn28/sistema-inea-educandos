
const path = require("path");

// Brevo utiliza su API HTTPS por el puerto 443.
// Esto evita los bloqueos de puertos SMTP de Render.

const COLOR_GUINDA = "#671235";
const MINUTOS_VIGENCIA = 30;

function escapar(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Cuerpo HTML del correo de recuperación
function construirHtmlRecuperacion(enlace) {
  const url = escapar(enlace);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>Recuperación de contraseña</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F6F3;">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Usa este enlace para elegir una nueva contraseña. Es válido por ${MINUTOS_VIGENCIA} minutos.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#F3F6F3;">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          style="width:100%;max-width:600px;background-color:#FFFFFF;border:1px solid #E2E8E3;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">

          <!-- Banner institucional -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <img src="cid:banner-inea" width="600"
                alt="Secretaría de Educación Pública · Instituto Nacional para la Educación de los Adultos"
                style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding:32px 36px 8px 36px;">
              <h1 style="margin:0 0 16px 0;font-size:22px;line-height:28px;color:#14201A;font-weight:bold;">
                Recuperación de contraseña
              </h1>

              <p style="margin:0 0 12px 0;font-size:15px;line-height:23px;color:#3E4C44;">
                Hola,
              </p>

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

          <!-- Enlace alternativo -->
          <tr>
            <td style="padding:0 36px 24px 36px;">
              <p style="margin:0 0 6px 0;font-size:13px;line-height:19px;color:#5F6C64;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>

              <p style="margin:0;font-size:12px;line-height:18px;color:${COLOR_GUINDA};word-break:break-all;">
                <a href="${url}" target="_blank"
                  style="color:${COLOR_GUINDA};text-decoration:underline;">
                  ${url}
                </a>
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
              <div style="height:3px;line-height:3px;font-size:0;background-color:${COLOR_GUINDA};">
                &nbsp;
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 36px 28px 36px;font-size:12px;line-height:18px;color:#5F6C64;">
              <strong style="color:#3E4C44;">
                Instituto Nacional para la Educación de los Adultos
              </strong><br />

              Calle Purísima Concepción S/N, 1a Cabecera, Municipio de San Felipe del Progreso,
              Estado de México, C.P. 50640<br />

              Tel: (712) 1235714 · czsanfelipedelprogreso@inea.gob.mx<br />

              <span style="color:#8A958E;">
                Este es un mensaje automático de SIGESE-INEA.
              </span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Versión en texto plano
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

// Envío de correo mediante la API HTTPS de Brevo
async function enviarCorreoRecuperacion(destinatario, enlace) {

  // Validar configuración
  if (!process.env.BREVO_API_KEY) {
    throw new Error("Falta configurar BREVO_API_KEY.");
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error("Falta configurar EMAIL_FROM.");
  }

  if (!destinatario || !enlace) {
    throw new Error("El destinatario y el enlace son obligatorios.");
  }

  const respuesta = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",

      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        "accept": "application/json",
      },

      body: JSON.stringify({
        sender: {
          name: "Sistema INEA - Educandos",
          email: process.env.EMAIL_FROM,
        },

        to: [
          {
            email: destinatario,
          },
        ],

        subject: "Recuperación de contraseña - SIGESE-INEA",

        htmlContent: construirHtmlRecuperacion(enlace),

        textContent: construirTextoRecuperacion(enlace),

        // Imagen institucional integrada al correo
        attachment: [
          {
            name: "encabezado-inea.jpg",
            content: require("fs")
              .readFileSync(
                path.join(
                  __dirname,
                  "..",
                  "assets",
                  "plantilla",
                  "encabezado-correo.jpg"
                )
              )
              .toString("base64"),
          },
        ],
      }),

      // Tiempo máximo de espera: 10 segundos
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!respuesta.ok) {
    const detalle = await respuesta.text();

    throw new Error(
      `Brevo respondió ${respuesta.status}: ${detalle}`
    );
  }

  return await respuesta.json();
}

module.exports = {
  enviarCorreoRecuperacion,
};
