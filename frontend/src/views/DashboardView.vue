<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <p class="text-sm text-ink-muted">Resumen de educandos activos registrados en el sistema.</p>
      <div class="flex flex-wrap gap-2">
        <a :href="urlExportar('excel')" class="btn-secondary">
          <Icon name="excel" :size="18" class="text-primary" />
          Exportar Excel
        </a>
        <a :href="urlExportar('pdf')" class="btn-secondary">
          <Icon name="pdf" :size="18" class="text-danger" />
          Exportar PDF
        </a>
        <a :href="urlExportar('graficas-pdf')" class="btn-secondary">
          <Icon name="chart" :size="18" class="text-nivel-inicial" />
          Gráficas en PDF
        </a>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="space-y-6" aria-busy="true">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div v-for="n in 5" :key="n" class="card h-32 animate-pulse bg-white" />
      </div>
      <div class="grid gap-6 lg:grid-cols-5">
        <div class="card h-80 animate-pulse lg:col-span-3" />
        <div class="card h-80 animate-pulse lg:col-span-2" />
      </div>
    </div>

    <template v-else>
      <!-- Indicadores -->
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Indicadores">
        <article v-for="k in indicadores" :key="k.titulo" class="card p-5">
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm text-ink-muted">{{ k.titulo }}</p>
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" :class="k.claseIcono">
              <Icon :name="k.icono" :size="18" />
            </span>
          </div>
          <p class="mt-4 text-3xl font-bold tabular-nums">{{ k.valor.toLocaleString("es-MX") }}</p>
          <p class="mt-1 text-xs text-ink-muted">{{ k.nota }}</p>
        </article>
      </section>

      <!-- Gráficas -->
      <section class="grid gap-6 lg:grid-cols-5">
        <div class="card p-6 lg:col-span-3">
          <h2 class="text-base">Registros por mes</h2>
          <p class="mb-4 text-xs text-ink-muted">Educandos registrados en cada mes</p>
          <div class="h-64">
            <Bar v-if="datosPorMes.labels.length" :data="datosPorMes" :options="opcionesBarras" />
            <p v-else class="flex h-full items-center justify-center text-sm text-ink-muted">
              Aún no hay registros para graficar
            </p>
          </div>
        </div>

        <div class="card p-6 lg:col-span-2">
          <h2 class="text-base">Distribución por nivel</h2>
          <p class="mb-4 text-xs text-ink-muted">Educandos activos según su nivel</p>
          <div v-if="total > 0" class="flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
            <div class="relative h-44 w-44 shrink-0">
              <Doughnut :data="datosPorNivel" :options="opcionesDona" />
              <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-bold tabular-nums">{{ total.toLocaleString("es-MX") }}</span>
                <span class="text-xs text-ink-muted">Total</span>
              </div>
            </div>
            <ul class="w-full space-y-3 text-sm">
              <li v-for="n in niveles" :key="n.nombre" class="flex items-center gap-3">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: n.color }" />
                <span class="flex-1 font-medium">{{ n.nombre }}</span>
                <span class="tabular-nums text-ink-muted">{{ n.total.toLocaleString("es-MX") }}</span>
              </li>
            </ul>
          </div>
          <p v-else class="flex h-44 items-center justify-center text-sm text-ink-muted">
            Aún no hay educandos registrados
          </p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Bar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import api from "../services/api";
import Icon from "../components/Icon.vue";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

const COLORES = { Alfabetización: "#1D5FD0", Primaria: "#E8710A", Secundaria: "#1B5E2F" };

const cargando = ref(true);
const porNivel = ref([]);
const porMes = ref([]);

const total = computed(() => porNivel.value.reduce((suma, n) => suma + n.total, 0));

const niveles = computed(() =>
  ["Alfabetización", "Primaria", "Secundaria"].map((nombre) => ({
    nombre,
    color: COLORES[nombre],
    total: porNivel.value.find((n) => n.nivel === nombre)?.total || 0,
  }))
);

function porcentaje(valor) {
  return total.value ? Math.round((valor / total.value) * 100) : 0;
}

const registrosEsteMes = computed(() => {
  const hoy = new Date();
  const clave = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  return porMes.value.find((m) => m.mes === clave)?.total || 0;
});

const indicadores = computed(() => [
  {
    titulo: "Total de educandos",
    valor: total.value,
    nota: "Expedientes activos",
    icono: "users",
    claseIcono: "bg-primary-50 text-primary",
  },
  {
    titulo: "Registros este mes",
    valor: registrosEsteMes.value,
    nota: "Altas del mes en curso",
    icono: "user-plus",
    claseIcono: "bg-nivel-inicial-bg text-nivel-inicial",
  },
  ...niveles.value.map((n) => ({
    titulo: `Nivel ${n.nombre}`,
    valor: n.total,
    nota: `${porcentaje(n.total)}% del total`,
    icono: "layers",
    claseIcono:
      n.nombre === "Alfabetización"
        ? "bg-nivel-inicial-bg text-nivel-inicial"
        : n.nombre === "Primaria"
          ? "bg-nivel-intermedio-bg text-nivel-intermedio"
          : "bg-nivel-avanzado-bg text-nivel-avanzado",
  })),
]);

function etiquetaMes(clave) {
  const [anio, mes] = clave.split("-").map(Number);
  const nombre = new Date(anio, mes - 1, 1).toLocaleDateString("es-MX", { month: "short" });
  return `${nombre.replace(".", "")} ${String(anio).slice(2)}`;
}

const datosPorMes = computed(() => ({
  labels: porMes.value.map((m) => etiquetaMes(m.mes)),
  datasets: [
    {
      label: "Registros",
      data: porMes.value.map((m) => m.total),
      backgroundColor: "#1B5E2F",
      hoverBackgroundColor: "#2A7A43",
      borderRadius: 6,
      maxBarThickness: 44,
    },
  ],
}));

const datosPorNivel = computed(() => ({
  labels: niveles.value.map((n) => n.nombre),
  datasets: [
    {
      data: niveles.value.map((n) => n.total),
      backgroundColor: niveles.value.map((n) => n.color),
      borderWidth: 3,
      borderColor: "#ffffff",
    },
  ],
}));

const opcionesBarras = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#5F6C64" } },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, color: "#5F6C64" },
      grid: { color: "#E2E8E3" },
      border: { display: false },
    },
  },
};

const opcionesDona = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: { legend: { display: false } },
};

onMounted(async () => {
  try {
    const { data } = await api.get("/dashboard/estadisticas");
    porNivel.value = data.porNivel;
    porMes.value = data.porMes;
  } finally {
    cargando.value = false;
  }
});

function urlExportar(tipo) {
  const base = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  const token = localStorage.getItem("token");
  // El navegador no puede mandar headers al dar clic en un link, asi que el token
  // va como query param; el backend tambien deberia aceptarlo asi para este caso especifico.
  return `${base}/reportes/${tipo}?token=${token}`;
}
</script>
