<template>
  <div>
    <h2 class="text-2xl mb-1">Dashboard</h2>
    <p class="text-ink/60 text-sm mb-8">Resumen de educandos registrados</p>

    <div v-if="cargando" class="text-ink/50 text-sm">Cargando estadísticas...</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white border border-ink/10 rounded-lg p-6">
        <h3 class="text-base font-medium mb-4 text-primary">Educandos por nivel</h3>
        <Bar :data="datosPorNivel" :options="opciones" />
      </div>

      <div class="bg-white border border-ink/10 rounded-lg p-6">
        <h3 class="text-base font-medium mb-4 text-primary">Registros por mes</h3>
        <Line :data="datosPorMes" :options="opciones" />
      </div>
    </div>

    <div class="mt-8 flex gap-3">
      <a
        :href="urlExportar('excel')"
        class="text-sm bg-primary text-white px-4 py-2 rounded hover:bg-primary-light transition-colors"
      >
        Exportar Excel
      </a>
      <a
        :href="urlExportar('pdf')"
        class="text-sm border border-primary text-primary px-4 py-2 rounded hover:bg-primary/5 transition-colors"
      >
        Exportar PDF
      </a>
      <a
        :href="urlExportar('graficas-pdf')"
        class="text-sm border border-primary text-primary px-4 py-2 rounded hover:bg-primary/5 transition-colors"
      >
        Gráficas en PDF
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Bar, Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import api from "../services/api";

ChartJS.register(Title, Tooltip, Legend, BarElement, LineElement, PointElement, CategoryScale, LinearScale);

const cargando = ref(true);
const datosPorNivel = ref({ labels: [], datasets: [] });
const datosPorMes = ref({ labels: [], datasets: [] });

const opciones = {
  responsive: true,
  plugins: { legend: { display: false } },
};

onMounted(async () => {
  try {
    const { data } = await api.get("/dashboard/estadisticas");

    datosPorNivel.value = {
      labels: data.porNivel.map((n) => n.nivel),
      datasets: [
        {
          label: "Educandos",
          data: data.porNivel.map((n) => n.total),
          backgroundColor: "#1E3A5F",
        },
      ],
    };

    datosPorMes.value = {
      labels: data.porMes.map((m) => m.mes),
      datasets: [
        {
          label: "Registros",
          data: data.porMes.map((m) => m.total),
          borderColor: "#C9A227",
          backgroundColor: "#C9A227",
        },
      ],
    };
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
