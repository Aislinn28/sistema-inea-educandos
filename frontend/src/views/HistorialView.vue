<template>
  <div>
    <h2 class="text-2xl mb-1">Historial de auditoría</h2>
    <p class="text-ink/60 text-sm mb-6">Quién creó, editó o eliminó cada expediente</p>

    <table class="tabla-expediente">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Usuario</th>
          <th>Acción</th>
          <th>Educando</th>
          <th>Detalle</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="registro in historial" :key="registro._id">
          <td>{{ new Date(registro.fecha).toLocaleString("es-MX") }}</td>
          <td>{{ registro.id_usuario?.nombre || "—" }}</td>
          <td class="capitalize">{{ registro.accion }}</td>
          <td>{{ registro.id_educando?.nombre || "—" }}</td>
          <td class="text-ink/60">{{ registro.detalle }}</td>
        </tr>
        <tr v-if="historial.length === 0">
          <td colspan="5" class="text-center text-ink/50 py-6">Aún no hay movimientos registrados</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const historial = ref([]);

onMounted(async () => {
  const { data } = await api.get("/historial");
  historial.value = data;
});
</script>
