<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl mb-1">Educandos</h2>
        <p class="text-ink/60 text-sm">Expedientes registrados en el sistema</p>
      </div>
      <button
        v-if="puedeEditar"
        @click="mostrarFormulario = true"
        class="text-sm bg-accent text-white px-4 py-2 rounded hover:bg-accent-dark transition-colors"
      >
        + Nuevo educando
      </button>
    </div>

    <div class="flex gap-3 mb-5">
      <input
        v-model="filtroRfe"
        @input="buscar"
        placeholder="Buscar por RFE..."
        class="border border-ink/20 rounded px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <select
        v-model="filtroNivel"
        @change="buscar"
        class="border border-ink/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">Todos los niveles</option>
        <option value="Inicial">Inicial</option>
        <option value="Intermedio">Intermedio</option>
        <option value="Avanzado">Avanzado</option>
      </select>
    </div>

    <p v-if="mensaje" class="text-success text-sm mb-3">{{ mensaje }}</p>

    <table class="tabla-expediente">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>RFE</th>
          <th>Fecha registro</th>
          <th>Nivel</th>
          <th v-if="puedeEditar">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in educandos" :key="e._id">
          <td>{{ e.nombre }}</td>
          <td>{{ e.rfe }}</td>
          <td>{{ new Date(e.fecha_registro).toLocaleDateString("es-MX") }}</td>
          <td>{{ e.nivel }}</td>
          <td v-if="puedeEditar" class="space-x-3">
            <button @click="abrirEdicion(e)" class="text-primary hover:underline">Editar</button>
            <button @click="abrirDocumentos(e)" class="text-primary hover:underline">Documentos</button>
            <button @click="eliminar(e)" class="text-danger hover:underline">Dar de baja</button>
          </td>
        </tr>
        <tr v-if="educandos.length === 0">
          <td :colspan="puedeEditar ? 5 : 4" class="text-center text-ink/50 py-6">
            No hay educandos que coincidan con la búsqueda
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal: alta de educando -->
    <div v-if="mostrarFormulario" class="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg w-full max-w-md p-6">
        <h3 class="text-lg mb-4">Nuevo educando</h3>
        <form @submit.prevent="crear" class="space-y-4">
          <input
            v-model="nuevo.nombre"
            required
            placeholder="Nombre completo"
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm"
          />
          <input
            v-model="nuevo.rfe"
            required
            placeholder="RFE"
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm"
          />
          <input
            v-model="nuevo.fecha_registro"
            type="date"
            required
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm"
          />
          <select v-model="nuevo.nivel" required class="w-full border border-ink/20 rounded px-3 py-2 text-sm">
            <option disabled value="">Selecciona un nivel</option>
            <option value="Inicial">Inicial</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>

          <p v-if="errorFormulario" class="text-danger text-sm">{{ errorFormulario }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="mostrarFormulario = false" class="text-sm text-ink/60">
              Cancelar
            </button>
            <button type="submit" class="text-sm bg-primary text-white px-4 py-2 rounded">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: editar educando -->
    <div v-if="educandoEditando" class="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg w-full max-w-md p-6">
        <h3 class="text-lg mb-4">Editar educando</h3>
        <form @submit.prevent="guardarEdicion" class="space-y-4">
          <input
            v-model="edicion.nombre"
            required
            placeholder="Nombre completo"
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm"
          />
          <input
            v-model="edicion.rfe"
            required
            placeholder="RFE"
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm"
          />
          <input
            v-model="edicion.fecha_registro"
            type="date"
            required
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm"
          />
          <select v-model="edicion.nivel" required class="w-full border border-ink/20 rounded px-3 py-2 text-sm">
            <option disabled value="">Selecciona un nivel</option>
            <option value="Inicial">Inicial</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>

          <p v-if="errorEdicion" class="text-danger text-sm">{{ errorEdicion }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="educandoEditando = null" class="text-sm text-ink/60">
              Cancelar
            </button>
            <button type="submit" class="text-sm bg-primary text-white px-4 py-2 rounded">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: documentos del educando -->
    <div v-if="educandoDocumentos" class="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg w-full max-w-md p-6">
        <h3 class="text-lg mb-1">Documentos de {{ educandoDocumentos.nombre }}</h3>
        <p class="text-ink/50 text-xs mb-4">RFE: {{ educandoDocumentos.rfe }}</p>

        <ul class="space-y-2 mb-4 max-h-52 overflow-y-auto">
          <li
            v-for="doc in educandoDocumentos.documentos"
            :key="doc._id"
            class="flex items-center justify-between text-sm border border-ink/10 rounded px-3 py-2"
          >
            <a :href="doc.url_cloudinary" target="_blank" class="text-primary hover:underline truncate mr-2">
              {{ doc.nombre_archivo }}
            </a>
            <button @click="eliminarDocumento(doc)" class="text-danger text-xs">Eliminar</button>
          </li>
          <li v-if="educandoDocumentos.documentos.length === 0" class="text-ink/40 text-sm">
            Sin documentos subidos
          </li>
        </ul>

        <p v-if="errorDocumentos" class="text-danger text-sm mb-2">{{ errorDocumentos }}</p>

        <div class="flex items-center gap-3 mb-4">
          <input ref="inputArchivos" type="file" multiple @change="seleccionarArchivos" class="text-sm flex-1" />
          <button
            @click="subirArchivos"
            :disabled="!archivosSeleccionados.length || subiendo"
            class="text-sm bg-primary text-white px-3 py-2 rounded disabled:opacity-40"
          >
            {{ subiendo ? "Subiendo..." : "Subir" }}
          </button>
        </div>

        <div class="flex justify-end">
          <button @click="cerrarDocumentos" class="text-sm text-ink/60">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../services/api";
import { useAuthStore } from "../store/auth";

const auth = useAuthStore();
const puedeEditar = computed(() => ["admin", "capturista"].includes(auth.rol));

const educandos = ref([]);
const filtroRfe = ref("");
const filtroNivel = ref("");
const mensaje = ref("");

const mostrarFormulario = ref(false);
const errorFormulario = ref("");
const nuevo = ref({ nombre: "", rfe: "", fecha_registro: "", nivel: "" });

const educandoEditando = ref(null);
const errorEdicion = ref("");
const edicion = ref({ nombre: "", rfe: "", fecha_registro: "", nivel: "" });

const educandoDocumentos = ref(null);
const inputArchivos = ref(null);
const archivosSeleccionados = ref([]);
const subiendo = ref(false);
const errorDocumentos = ref("");

async function cargar() {
  const { data } = await api.get("/educandos", {
    params: { rfe: filtroRfe.value || undefined, nivel: filtroNivel.value || undefined },
  });
  educandos.value = data;
}

let temporizador = null;
function buscar() {
  clearTimeout(temporizador);
  temporizador = setTimeout(cargar, 300);
}

async function crear() {
  errorFormulario.value = "";
  try {
    await api.post("/educandos", nuevo.value);
    mostrarFormulario.value = false;
    nuevo.value = { nombre: "", rfe: "", fecha_registro: "", nivel: "" };
    mensaje.value = "Educando registrado correctamente";
    await cargar();
  } catch (err) {
    errorFormulario.value = err.response?.data?.mensaje || "No se pudo registrar el educando";
  }
}

async function eliminar(educando) {
  if (!confirm(`¿Dar de baja a ${educando.nombre}?`)) return;
  await api.delete(`/educandos/${educando._id}`);
  mensaje.value = "Educando dado de baja";
  await cargar();
}

function abrirEdicion(educando) {
  errorEdicion.value = "";
  edicion.value = {
    nombre: educando.nombre,
    rfe: educando.rfe,
    fecha_registro: new Date(educando.fecha_registro).toISOString().slice(0, 10),
    nivel: educando.nivel,
  };
  educandoEditando.value = educando;
}

async function guardarEdicion() {
  errorEdicion.value = "";
  try {
    await api.put(`/educandos/${educandoEditando.value._id}`, edicion.value);
    mensaje.value = "Educando actualizado correctamente";
    educandoEditando.value = null;
    await cargar();
  } catch (err) {
    errorEdicion.value = err.response?.data?.mensaje || "No se pudo actualizar el educando";
  }
}

function abrirDocumentos(educando) {
  errorDocumentos.value = "";
  archivosSeleccionados.value = [];
  educandoDocumentos.value = educando;
}

function cerrarDocumentos() {
  educandoDocumentos.value = null;
  archivosSeleccionados.value = [];
  errorDocumentos.value = "";
}

function seleccionarArchivos(evento) {
  archivosSeleccionados.value = Array.from(evento.target.files || []);
}

async function subirArchivos() {
  if (!archivosSeleccionados.value.length) return;

  errorDocumentos.value = "";
  subiendo.value = true;

  const formData = new FormData();
  for (const archivo of archivosSeleccionados.value) {
    formData.append("documentos", archivo);
  }

  try {
    const { data } = await api.post(`/educandos/${educandoDocumentos.value._id}/documentos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    educandoDocumentos.value.documentos = data.documentos;
    archivosSeleccionados.value = [];
    if (inputArchivos.value) inputArchivos.value.value = "";
    await cargar();
  } catch (err) {
    errorDocumentos.value = err.response?.data?.mensaje || "No se pudieron subir los documentos";
  } finally {
    subiendo.value = false;
  }
}

async function eliminarDocumento(documento) {
  if (!confirm(`¿Eliminar el documento "${documento.nombre_archivo}"?`)) return;

  errorDocumentos.value = "";
  try {
    await api.delete(`/educandos/${educandoDocumentos.value._id}/documentos/${documento._id}`);
    educandoDocumentos.value.documentos = educandoDocumentos.value.documentos.filter(
      (d) => d._id !== documento._id
    );
  } catch (err) {
    errorDocumentos.value = err.response?.data?.mensaje || "No se pudo eliminar el documento";
  }
}

onMounted(cargar);
</script>