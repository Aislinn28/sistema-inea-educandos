<template>
  <div class="space-y-5">
    <p class="text-sm text-ink-muted">Quién creó, editó o eliminó cada expediente.</p>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="tabla">
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
              <td class="whitespace-nowrap tabular-nums">
                {{ new Date(registro.fecha).toLocaleString("es-MX") }}
              </td>
              <td>{{ registro.id_usuario?.nombre || "—" }}</td>
              <td>
                <span class="badge" :class="clasesAccion[registro.accion]">
                  <span class="capitalize">{{ registro.accion }}</span>
                </span>
              </td>
              <td class="!font-medium !text-ink">{{ registro.id_educando?.nombre || "—" }}</td>
              <td class="text-ink-muted">{{ registro.detalle }}</td>
            </tr>
            <tr v-if="historial.length === 0">
              <td colspan="5" class="py-12 text-center text-ink-muted">
                Aún no hay movimientos registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const historial = ref([]);

const clasesAccion = {
  crear: "bg-nivel-avanzado-bg text-nivel-avanzado",
  editar: "bg-nivel-intermedio-bg text-nivel-intermedio",
  eliminar: "bg-danger-50 text-danger",
};

onMounted(async () => {
  const { data } = await api.get("/historial");
  historial.value = data;
});
</script>
