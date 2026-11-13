const path = require("path");
const PDFDocument = require("pdfkit");

// Plantilla institucional (SEP / INEA) tomada de platilla_documentos.docx:
// hoja Carta, banner a todo lo ancho arriba y pie con la direccion de la Coordinacion de Zona.
const ENCABEZADO = path.join(__dirname, "..", "assets", "plantilla", "encabezado.png");
const PIE = path.join(__dirname, "..", "assets", "plantilla", "pie.png");

const PAGINA = { ancho: 612, alto: 792 }; // Carta, en puntos
const MARGEN = { izquierdo: 85.05, derecho: 85.05, superior: 100, inferior: 95 };
const ANCHO_CONTENIDO = PAGINA.ancho - MARGEN.izquierdo - MARGEN.derecho; // 441.9
const LIMITE_Y = PAGINA.alto - MARGEN.inferior; // hasta donde puede llegar el contenido
const COLOR_GUINDA = "#671235"; // barra del banner
const COLOR_TEXTO_SUAVE = "#5F6C64";

// Dibuja banner y pie en la pagina actual y deja el cursor al inicio del contenido
function dibujarPlantilla(doc) {
  doc.image(ENCABEZADO, 0, 0, { width: PAGINA.ancho });
  doc.image(PIE, 80.17, 715, { width: ANCHO_CONTENIDO });
  doc.x = MARGEN.izquierdo;
  doc.y = MARGEN.superior;
}

// Crea un PDF Carta con la plantilla en TODAS las paginas (tambien las que se agreguen solas)
function crearDocumento() {
  const doc = new PDFDocument({
    size: "LETTER",
    bufferPages: true, // permite numerar "Pagina X de Y" al final
    margins: {
      top: MARGEN.superior,
      bottom: MARGEN.inferior,
      left: MARGEN.izquierdo,
      right: MARGEN.derecho,
    },
  });
  doc.on("pageAdded", () => dibujarPlantilla(doc));
  dibujarPlantilla(doc);
  return doc;
}

// Titulo del documento + linea de "generado el". Devuelve la Y donde sigue el contenido.
function dibujarTitulo(doc, titulo, subtitulo) {
  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor(COLOR_GUINDA)
    .text(titulo, MARGEN.izquierdo, MARGEN.superior, { width: ANCHO_CONTENIDO, align: "center" });
  if (subtitulo) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLOR_TEXTO_SUAVE)
      .text(subtitulo, MARGEN.izquierdo, doc.y + 4, { width: ANCHO_CONTENIDO, align: "center" });
  }
  doc.fillColor("#000000");
  return doc.y + 16;
}

// Escribe "Pagina X de Y" arriba del pie en todas las paginas. Llamar justo antes de doc.end().
function agregarNumerosDePagina(doc) {
  const { count } = doc.bufferedPageRange();
  const margenInferior = doc.page.margins.bottom;
  for (let i = 0; i < count; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0; // evita que PDFKit cree una pagina nueva al escribir cerca del pie
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLOR_TEXTO_SUAVE)
      .text(`Página ${i + 1} de ${count}`, MARGEN.izquierdo, 703, {
        width: ANCHO_CONTENIDO,
        align: "right",
        lineBreak: false,
      });
  }
  doc.page.margins.bottom = margenInferior;
  doc.fillColor("#000000");
}

module.exports = {
  crearDocumento,
  dibujarTitulo,
  agregarNumerosDePagina,
  MARGEN,
  ANCHO_CONTENIDO,
  LIMITE_Y,
  COLOR_GUINDA,
};
