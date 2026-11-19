
const ExcelJS = require("exceljs");
const {
  crearDocumento,
  dibujarTitulo,
  agregarNumerosDePagina,
  MARGEN,
  ANCHO_CONTENIDO,
  LIMITE_Y,
  COLOR_GUINDA,
} = require("../utils/plantillaPdf");

const { obtenerEducandosNumerados } = require("../utils/educandosNumerados");
const { obtenerPorNivel, obtenerPorMes } = require("./dashboardController");

const {
  construirUrlGraficaPorNivel,
  construirUrlGraficaPorMes,
  descargarImagenGrafica,
} = require("../utils/graficas");

// true = las bajas aparecen en su lugar con la etiqueta BAJA
// false = solo se exportan los educandos activos
const INCLUIR_BAJAS = true;

async function obtenerParaExportar() {
  const todos = await obtenerEducandosNumerados();
  return INCLUIR_BAJAS
    ? todos
    : todos.filter((e) => e.estatus === "activo");
}

// Exporta los educandos a un .xlsx con una hoja por letra
async function exportarExcel(req, res) {
  try {
    const educandos = await obtenerParaExportar();

    const workbook = new ExcelJS.Workbook();

    // Solo se crean las hojas de las letras que tienen educandos
    const letras = [...new Set(educandos.map((e) => e.letra))];

    letras.forEach((letra) => {
      const hoja = workbook.addWorksheet(letra);

      hoja.columns = [
        { header: "No.", key: "numero", width: 8 },
        { header: "Nombre", key: "nombre", width: 34 },
        { header: "RFE", key: "rfe", width: 20 },
        { header: "Fecha de registro", key: "fecha_registro", width: 18 },
        { header: "Nivel", key: "nivel", width: 15 },
      ];

      // Encabezado en verde, fijo al hacer scroll y con filtros
      const encabezado = hoja.getRow(1);
      encabezado.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
      };

      encabezado.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1B5E2F" },
      };

      hoja.views = [{ state: "frozen", ySplit: 1 }];
      hoja.autoFilter = { from: "A1", to: "E1" };

      educandos
        .filter((e) => e.letra === letra)
        .forEach((e) => {
          const fila = hoja.addRow({
            numero: e.estatus === "activo" ? e.numero : "BAJA",
            nombre: e.nombre,
            rfe: e.rfe,

            // Fecha de registro respetando UTC
            fecha_registro: new Date(e.fecha_registro).toLocaleDateString(
              "es-MX",
              { timeZone: "UTC" }
            ),

            nivel: e.nivel,
          });

          fila.getCell("numero").alignment = {
            horizontal: "center",
          };

          if (e.estatus !== "activo") {
            fila.font = {
              italic: true,
              color: { argb: "FFB42318" },
            };
          }
        });
    });

    // Un libro sin hojas no se puede abrir
    if (letras.length === 0) {
      workbook.addWorksheet("Educandos");
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=educandos.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al exportar a Excel",
      error: error.message,
    });
  }
}

// Exporta los educandos a un PDF con la plantilla institucional
async function exportarPdf(req, res) {
  try {
    const educandos = await obtenerParaExportar();

    const doc = crearDocumento();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=educandos.pdf"
    );

    doc.pipe(res);

    let y = dibujarTitulo(
      doc,
      "Reporte de Educandos",
      `Orden alfabético por apellido paterno - Generado el ${new Date().toLocaleString(
        "es-MX",
        { timeZone: "America/Mexico_City" }
      )}`
    );

    // Las columnas suman el ancho útil de la plantilla (441.9 pt)
    const columnas = [
      { titulo: "No.", ancho: 36 },
      { titulo: "Nombre", ancho: 168 },
      { titulo: "RFE", ancho: 98 },
      { titulo: "Fecha registro", ancho: 70 },
      { titulo: "Nivel", ancho: 70 },
    ];

    const anchoTabla = columnas.reduce(
      (suma, c) => suma + c.ancho,
      0
    );

    const x0 = MARGEN.izquierdo;

    // Dibuja una fila en coordenadas fijas
    function dibujarFila(
      valores,
      y,
      { negrita = false, color = "#000000", italica = false } = {}
    ) {
      const fuente = negrita
        ? "Helvetica-Bold"
        : italica
          ? "Helvetica-Oblique"
          : "Helvetica";

      doc.font(fuente).fontSize(9).fillColor(color);

      const alto = Math.max(
        ...valores.map((v, i) =>
          doc.heightOfString(String(v), {
            width: columnas[i].ancho - 6,
          })
        )
      );

      let x = x0;

      valores.forEach((valor, i) => {
        doc.text(String(valor), x, y, {
          width: columnas[i].ancho - 6,
        });

        x += columnas[i].ancho;
      });

      doc.fillColor("#000000");

      return alto;
    }

    function dibujarEncabezadoTabla(y) {
      dibujarFila(
        columnas.map((c) => c.titulo),
        y,
        { negrita: true }
      );

      doc
        .moveTo(x0, y + 14)
        .lineTo(x0 + anchoTabla, y + 14)
        .strokeColor("#CCCCCC")
        .stroke();

      return y + 20;
    }

    function nuevaPagina() {
      doc.addPage();
      return dibujarEncabezadoTabla(MARGEN.superior);
    }

    y = dibujarEncabezadoTabla(y);

    let letraActual = null;

    educandos.forEach((educando) => {
      // Barra guinda con la letra al empezar cada grupo
      if (educando.letra !== letraActual) {
        if (y + 50 > LIMITE_Y) {
          y = nuevaPagina();
        }

        doc
          .rect(x0, y - 2, anchoTabla, 17)
          .fill(COLOR_GUINDA);

        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor("#FFFFFF")
          .text(`Letra ${educando.letra}`, x0 + 6, y + 2);

        doc.fillColor("#000000");

        y += 23;
        letraActual = educando.letra;
      }

      const baja = educando.estatus !== "activo";

      const valores = [
        baja ? "BAJA" : educando.numero,
        educando.nombre,
        educando.rfe,

        // Fecha de registro respetando UTC
        new Date(educando.fecha_registro).toLocaleDateString(
          "es-MX",
          { timeZone: "UTC" }
        ),

        educando.nivel,
      ];

      // Si la fila no cabe en lo que queda de la página, pasa a la siguiente
      doc.font("Helvetica").fontSize(9);

      const altoEstimado = doc.heightOfString(
        String(educando.nombre),
        { width: columnas[1].ancho - 6 }
      );

      if (y + altoEstimado > LIMITE_Y - 6) {
        y = nuevaPagina();
      }

      const alto = dibujarFila(
        valores,
        y,
        baja
          ? { color: "#B42318", italica: true }
          : {}
      );

      y += alto + 8;
    });

    agregarNumerosDePagina(doc);
    doc.end();

  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al exportar a PDF",
      error: error.message,
    });
  }
}

// Exporta un PDF con las gráficas del dashboard
async function exportarGraficasPdf(req, res) {
  try {
    const [porNivel, porMes] = await Promise.all([
      obtenerPorNivel(),
      obtenerPorMes(),
    ]);

    const urlNivel = construirUrlGraficaPorNivel(
      porNivel.map((n) => ({
        nivel: n._id,
        total: n.total,
      }))
    );

    const urlMes = construirUrlGraficaPorMes(
      porMes.map((m) => ({
        mes: m._id,
        total: m.total,
      }))
    );

    const [imagenNivel, imagenMes] = await Promise.all([
      descargarImagenGrafica(urlNivel),
      descargarImagenGrafica(urlMes),
    ]);

    const doc = crearDocumento();

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=dashboard_educandos.pdf"
    );

    doc.pipe(res);

    let y = dibujarTitulo(
      doc,
      "Dashboard de Educandos",
      `Generado el ${new Date().toLocaleString(
        "es-MX",
        { timeZone: "America/Mexico_City" }
      )}`
    );

    // Las dos gráficas caben en una sola página
    const ALTO_GRAFICA = 235;

    doc.image(imagenNivel, MARGEN.izquierdo, y, {
      fit: [ANCHO_CONTENIDO, ALTO_GRAFICA],
      align: "center",
    });

    y += ALTO_GRAFICA + 14;

    doc.image(imagenMes, MARGEN.izquierdo, y, {
      fit: [ANCHO_CONTENIDO, ALTO_GRAFICA],
      align: "center",
    });

    agregarNumerosDePagina(doc);
    doc.end();

  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al exportar las graficas a PDF",
      error: error.message,
    });
  }
}

module.exports = {
  exportarExcel,
  exportarPdf,
  exportarGraficasPdf,
};
