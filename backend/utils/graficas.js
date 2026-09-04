// QuickChart es un servicio gratuito que genera imagenes de graficas a partir
// de una configuracion tipo Chart.js, sin tener que instalar librerias nativas
// de dibujo en el servidor (evita problemas de compilacion en Render).
function construirUrlGraficaPorNivel(porNivel) {
  const config = {
    type: "bar",
    data: {
      labels: porNivel.map((n) => n.nivel),
      datasets: [
        {
          label: "Educandos por nivel",
          data: porNivel.map((n) => n.total),
          backgroundColor: "#2563eb",
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      title: { display: true, text: "Educandos registrados por nivel" },
    },
  };

  return `https://quickchart.io/chart?width=500&height=300&format=png&c=${encodeURIComponent(
    JSON.stringify(config)
  )}`;
}

function construirUrlGraficaPorMes(porMes) {
  const config = {
    type: "line",
    data: {
      labels: porMes.map((m) => m.mes),
      datasets: [
        {
          label: "Registros por mes",
          data: porMes.map((m) => m.total),
          borderColor: "#16a34a",
          fill: false,
        },
      ],
    },
    options: {
      title: { display: true, text: "Registros mensuales" },
    },
  };

  return `https://quickchart.io/chart?width=500&height=300&format=png&c=${encodeURIComponent(
    JSON.stringify(config)
  )}`;
}

// Descarga la imagen de la grafica como buffer, lista para insertarse en el PDF
async function descargarImagenGrafica(url) {
  const respuesta = await fetch(url);
  const arrayBuffer = await respuesta.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

module.exports = { construirUrlGraficaPorNivel, construirUrlGraficaPorMes, descargarImagenGrafica };
