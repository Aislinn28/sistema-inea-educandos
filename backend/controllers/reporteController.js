const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const Educando = require("../models/Educando");
const { obtenerPorNivel, obtenerPorMes } = require("./dashboardController");
const {
  construirUrlGraficaPorNivel,
  construirUrlGraficaPorMes,
  descargarImagenGrafica,
} = require("../utils/graficas");

// Exporta la lista de educandos activos a un archivo .xlsx (requisito 6)
async function exportarExcel(req, res) {
  try {
    const educandos = await Educando.find({ estatus: "activo" }).sort({ fecha_registro: -1 });

    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Educandos");

    hoja.columns = [
      { header: "Nombre", key: "nombre", width: 30 },
      { header: "RFE", key: "rfe", width: 20 },
      { header: "Fecha de registro", key: "fecha_registro", width: 18 },
      { header: "Nivel", key: "nivel", width: 15 },
    ];

    hoja.getRow(1).font = { bold: true };

    educandos.forEach((e) => {
      hoja.addRow({
        nombre: e.nombre,
        rfe: e.rfe,
        fecha_registro: e.fecha_registro.toLocaleDateString("es-MX"),
        nivel: e.nivel,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=educandos.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al exportar a Excel", error: error.message });
  }
}

// Exporta la lista de educandos activos a un PDF en forma de tabla (requisito 6)
async function exportarPdf(req, res) {
  try {
    const educandos = await Educando.find({ estatus: "activo" }).sort({ fecha_registro: -1 });

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=educandos.pdf");
    doc.pipe(res);

    doc.fontSize(16).text("Reporte de Educandos - INEA", { align: "center" });
    doc.moveDown();

    const margenIzquierdo = doc.page.margins.left;
    const columnas = [
      { titulo: "Nombre", ancho: 180 },
      { titulo: "RFE", ancho: 100 },
      { titulo: "Fecha registro", ancho: 100 },
      { titulo: "Nivel", ancho: 100 },
    ];

    // Dibuja una fila completa en coordenadas fijas, sin depender de doc.x/doc.y
    // (asi evitamos que el cursor interno se desalinee entre columnas)
    function dibujarFila(valores, y, negrita = false) {
      let x = margenIzquierdo;
      doc.font(negrita ? "Helvetica-Bold" : "Helvetica").fontSize(10);
      valores.forEach((valor, i) => {
        doc.text(String(valor), x, y, { width: columnas[i].ancho });
        x += columnas[i].ancho;
      });
    }

    let y = doc.y;
    dibujarFila(
      columnas.map((c) => c.titulo),
      y,
      true
    );
    y += 20;

    educandos.forEach((educando) => {
      if (y > 750) {
        doc.addPage();
        y = 40;
      }

      dibujarFila(
        [
          educando.nombre,
          educando.rfe,
          educando.fecha_registro.toLocaleDateString("es-MX"),
          educando.nivel,
        ],
        y
      );
      y += 20;
    });

    doc.end();
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al exportar a PDF", error: error.message });
  }
}

// Exporta un PDF con las graficas del dashboard (requisito 7)
async function exportarGraficasPdf(req, res) {
  try {
    const [porNivel, porMes] = await Promise.all([obtenerPorNivel(), obtenerPorMes()]);

    const urlNivel = construirUrlGraficaPorNivel(
      porNivel.map((n) => ({ nivel: n._id, total: n.total }))
    );
    const urlMes = construirUrlGraficaPorMes(porMes.map((m) => ({ mes: m._id, total: m.total })));

    const [imagenNivel, imagenMes] = await Promise.all([
      descargarImagenGrafica(urlNivel),
      descargarImagenGrafica(urlMes),
    ]);

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=dashboard_educandos.pdf");
    doc.pipe(res);

    doc.fontSize(16).text("Dashboard de Educandos - INEA", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Generado el ${new Date().toLocaleString("es-MX")}`, { align: "center" });
    doc.moveDown(2);

    doc.image(imagenNivel, { fit: [500, 300], align: "center" });
    doc.moveDown();
    doc.addPage();
    doc.image(imagenMes, { fit: [500, 300], align: "center" });

    doc.end();
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al exportar las graficas a PDF", error: error.message });
  }
}

module.exports = { exportarExcel, exportarPdf, exportarGraficasPdf };
