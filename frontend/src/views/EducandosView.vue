<template>
  <div class="space-y-5">
    <!-- Barra de herramientas -->
    <div class="card flex flex-wrap items-center gap-3 p-4">
      <div class="relative min-w-[200px] flex-1 sm:max-w-xs">
        <Icon
          name="search"
          :size="18"
          class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          v-model="filtroRfe"
          @input="buscar"
          placeholder="Buscar por RFE..."
          aria-label="Buscar por RFE"
          class="input pl-10"
        />
      </div>

      <select
        v-model="filtroNivel"
        @change="buscar"
        aria-label="Filtrar por nivel"
        class="input w-auto"
      >
        <option value="">Todos los niveles</option>
        <option value="Alfabetización">Alfabetización</option>
        <option value="Primaria">Primaria</option>
        <option value="Secundaria">Secundaria</option>
      </select>

      <button
        v-if="puedeEditar"
        @click="mostrarFormulario = true"
        class="btn-primary ml-auto"
      >
        <Icon name="plus" :size="18" />
        Nuevo educando
      </button>
    </div>

    <p v-if="mensaje" class="aviso-ok" role="status">
      <Icon name="check-circle" :size="18" class="mt-0.5 shrink-0" />
      <span>{{ mensaje }}</span>
    </p>

    <!-- Tabla -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="tabla">
          <thead>
            <tr>
              <th class="w-20">No.</th>
              <th>Nombre completo</th>
              <th>RFE</th>
              <th>Nivel</th>
              <th>Fecha de registro</th>
              <th>Documentos</th>
              <th v-if="puedeEditar" class="text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="e in educandosVisibles"
              :key="e._id"
              :class="{ '[&>td:not(:last-child)]:opacity-60': e.estatus === 'inactivo' }"
            >
              <td class="whitespace-nowrap tabular-nums">
                <span
                  v-if="e.estatus === 'activo'"
                  class="font-semibold text-ink"
                >
                  {{ e.numero }}
                </span>
                <span v-else class="badge bg-danger-50 font-semibold text-danger">
                  BAJA
                </span>
              </td>

              <td class="!font-medium !text-ink">{{ e.nombre }}</td>

              <td class="whitespace-nowrap !font-medium !text-ink tabular-nums tracking-wide">
                {{ e.rfe }}
              </td>

              <td>
                <span :class="claseNivel[e.nivel]">{{ e.nivel }}</span>
              </td>

              <td class="whitespace-nowrap tabular-nums">
                {{ formatearFecha(e.fecha_registro) }}
              </td>

              <td>
                <span class="inline-flex items-center gap-1.5 tabular-nums">
                  <Icon name="file" :size="16" class="text-ink-muted" />
                  {{ e.documentos?.length || 0 }}
                </span>
              </td>

              <td v-if="puedeEditar">
                <div class="flex justify-end gap-1">
                  <button
                    v-if="e.estatus === 'activo'"
                    @click="abrirEdicion(e)"
                    class="icon-btn"
                    title="Editar"
                    aria-label="Editar educando"
                  >
                    <Icon name="pencil" :size="17" />
                  </button>

                  <button
                    @click="abrirDocumentos(e)"
                    class="icon-btn"
                    title="Documentos"
                    aria-label="Ver documentos"
                  >
                    <Icon name="folder" :size="17" />
                  </button>

                  <button
                    v-if="e.estatus !== 'activo'"
                    @click="reactivar(e)"
                    class="icon-btn !text-primary hover:bg-primary-50"
                    title="Reactivar"
                    aria-label="Reactivar educando"
                  >
                    <Icon name="check-circle" :size="17" />
                  </button>

                  <button
                    v-if="e.estatus === 'activo'"
                    @click="eliminar(e)"
                    class="icon-btn icon-btn-danger"
                    title="Dar de baja"
                    aria-label="Dar de baja educando"
                  >
                    <Icon name="trash" :size="17" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="educandosVisibles.length === 0">
              <td
                :colspan="puedeEditar ? 7 : 6"
                class="py-12 text-center text-ink-muted"
              >
                {{
                  educandos.length === 0
                    ? "No hay educandos que coincidan con la búsqueda"
                    : `No hay educandos en la letra ${letraActiva}`
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pestañas por letra -->
      <div class="flex items-stretch border-t border-line bg-surface">
        <div class="flex shrink-0 items-center px-4 text-sm text-ink-muted">
          Hoja
          <span class="ml-1 font-semibold text-ink">{{ letraActiva }}</span>
          <span class="ml-2 hidden sm:inline">
            · {{ educandosVisibles.length }}
            {{ educandosVisibles.length === 1 ? "registro" : "registros" }}
          </span>
        </div>

        <div
          class="flex flex-1 overflow-x-auto"
          role="tablist"
          aria-label="Letra del apellido paterno"
        >
          <button
            v-for="letra in letras"
            :key="letra"
            type="button"
            role="tab"
            :aria-selected="letra === letraActiva"
            :title="`${conteoPorLetra[letra] || 0} registro(s)`"
            @click="letraActiva = letra"
            class="min-w-[2.5rem] shrink-0 border-t-2 px-3 py-2.5 text-sm font-medium transition-colors"
            :class="
              letra === letraActiva
                ? 'border-primary bg-white font-bold text-primary'
                : conteoPorLetra[letra]
                  ? 'border-transparent text-ink-soft hover:bg-white'
                  : 'border-transparent text-ink-muted/40 hover:bg-white'
            "
          >
            {{ letra }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: alta de educando -->
    <ModalBase
      v-if="mostrarFormulario"
      titulo="Registrar nuevo educando"
      subtitulo="Captura los datos personales del expediente"
      ancho="max-w-2xl"
      @cerrar="mostrarFormulario = false"
    >
      <form @submit.prevent="crear" class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label for="n-nombres" class="label">Nombre(s) *</label>
            <input
              id="n-nombres"
              v-model="nuevo.nombres"
              required
              placeholder="Nombre(s)"
              class="input"
            />
          </div>

          <div>
            <label for="n-ap" class="label">Apellido paterno *</label>
            <input
              id="n-ap"
              v-model="nuevo.apellido_paterno"
              required
              placeholder="Apellido paterno"
              class="input"
            />
          </div>

          <div>
            <label for="n-am" class="label">Apellido materno</label>
            <input
              id="n-am"
              v-model="nuevo.apellido_materno"
              placeholder="Apellido materno (opcional)"
              class="input"
            />
          </div>

          <div class="sm:col-span-2">
            <label for="n-rfe" class="label">RFE *</label>
            <input
              id="n-rfe"
              v-model="nuevo.rfe"
              required
              placeholder="RFE"
              class="input uppercase"
            />
          </div>

          <div>
            <label for="n-fecha" class="label">Fecha de registro *</label>
            <FechaInput
              id="n-fecha"
              v-model="nuevo.fecha_registro"
              required
            />
          </div>

          <div>
            <label for="n-nivel" class="label">Nivel *</label>
            <select
              id="n-nivel"
              v-model="nuevo.nivel"
              required
              class="input"
            >
              <option disabled value="">Selecciona un nivel</option>
              <option value="Alfabetización">Alfabetización</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
            </select>
          </div>
        </div>

        <p v-if="errorFormulario" class="aviso-error" role="alert">
          <Icon name="alert-circle" :size="18" class="mt-0.5 shrink-0" />
          <span>{{ errorFormulario }}</span>
        </p>

        <div class="flex justify-end gap-3 border-t border-line pt-4">
          <button
            type="button"
            @click="mostrarFormulario = false"
            class="btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" class="btn-primary">Guardar</button>
        </div>
      </form>
    </ModalBase>

    <!-- Modal: editar educando -->
    <ModalBase
      v-if="educandoEditando"
      titulo="Editar educando"
      :subtitulo="educandoEditando.nombre"
      ancho="max-w-2xl"
      @cerrar="educandoEditando = null"
    >
      <form @submit.prevent="guardarEdicion" class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label for="e-nombres" class="label">Nombre(s) *</label>
            <input
              id="e-nombres"
              v-model="edicion.nombres"
              required
              placeholder="Nombre(s)"
              class="input"
            />
          </div>

          <div>
            <label for="e-ap" class="label">Apellido paterno *</label>
            <input
              id="e-ap"
              v-model="edicion.apellido_paterno"
              required
              placeholder="Apellido paterno"
              class="input"
            />
          </div>

          <div>
            <label for="e-am" class="label">Apellido materno</label>
            <input
              id="e-am"
              v-model="edicion.apellido_materno"
              placeholder="Apellido materno (opcional)"
              class="input"
            />
          </div>

          <div class="sm:col-span-2">
            <label for="e-rfe" class="label">RFE *</label>
            <input
              id="e-rfe"
              v-model="edicion.rfe"
              required
              placeholder="RFE"
              class="input uppercase"
            />
          </div>

          <div>
            <label for="e-fecha" class="label">Fecha de registro *</label>
            <FechaInput
              id="e-fecha"
              v-model="edicion.fecha_registro"
              required
            />
          </div>

          <div>
            <label for="e-nivel" class="label">Nivel *</label>
            <select
              id="e-nivel"
              v-model="edicion.nivel"
              required
              class="input"
            >
              <option disabled value="">Selecciona un nivel</option>
              <option value="Alfabetización">Alfabetización</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
            </select>
          </div>
        </div>

        <p v-if="errorEdicion" class="aviso-error" role="alert">
          <Icon name="alert-circle" :size="18" class="mt-0.5 shrink-0" />
          <span>{{ errorEdicion }}</span>
        </p>

        <div class="flex justify-end gap-3 border-t border-line pt-4">
          <button
            type="button"
            @click="educandoEditando = null"
            class="btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" class="btn-primary">
            Guardar cambios
          </button>
        </div>
      </form>
    </ModalBase>

    <!-- Modal: documentos del educando -->
    <ModalBase
      v-if="educandoDocumentos"
      :titulo="`Documentos de ${educandoDocumentos.nombre}`"
      :subtitulo="`RFE: ${educandoDocumentos.rfe}`"
      @cerrar="cerrarDocumentos"
    >
      <ul class="mb-5 max-h-60 space-y-2 overflow-y-auto">
        <li
          v-for="doc in educandoDocumentos.documentos"
          :key="doc._id"
          class="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary"
          >
            <Icon name="file" :size="16" />
          </span>

          <a
            :href="doc.url_cloudinary"
            target="_blank"
            rel="noopener"
            class="min-w-0 flex-1 truncate font-medium text-ink hover:text-primary hover:underline"
          >
            {{ doc.nombre_archivo }}
          </a>

          <button
            @click="eliminarDocumento(doc)"
            class="icon-btn icon-btn-danger"
            title="Eliminar documento"
            aria-label="Eliminar documento"
          >
            <Icon name="trash" :size="16" />
          </button>
        </li>

        <li
          v-if="educandoDocumentos.documentos.length === 0"
          class="rounded-lg border border-dashed border-line px-3 py-6 text-center text-sm text-ink-muted"
        >
          Sin documentos subidos
        </li>
      </ul>

      <p v-if="errorDocumentos" class="aviso-error mb-4" role="alert">
        <Icon name="alert-circle" :size="18" class="mt-0.5 shrink-0" />
        <span>{{ errorDocumentos }}</span>
      </p>

      <label
        class="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary-50/50 px-4 py-6 text-center transition-colors hover:bg-primary-50 focus-within:ring-2 focus-within:ring-primary/40"
      >
        <Icon name="upload" :size="28" class="text-primary" />

        <span class="text-sm font-medium text-ink">
          {{
            archivosSeleccionados.length
              ? `${archivosSeleccionados.length} archivo(s) seleccionado(s)`
              : "Haz clic para elegir archivos"
          }}
        </span>

        <span class="text-xs text-ink-muted">
          Puedes seleccionar varios a la vez
        </span>

        <input
          ref="inputArchivos"
          type="file"
          multiple
          @change="seleccionarArchivos"
          class="sr-only"
        />
      </label>

      <div class="flex justify-end gap-3 border-t border-line pt-4">
        <button @click="cerrarDocumentos" class="btn-secondary">
          Cerrar
        </button>

        <button
          @click="subirArchivos"
          :disabled="!archivosSeleccionados.length || subiendo"
          class="btn-primary"
        >
          <Icon name="upload" :size="18" />
          {{ subiendo ? "Subiendo..." : "Subir" }}
        </button>
      </div>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../services/api";
import Icon from "../components/Icon.vue";
import ModalBase from "../components/ModalBase.vue";
import FechaInput from "../components/FechaInput.vue";
import { useAuthStore } from "../store/auth";

const auth = useAuthStore();

// Solo presentación: clase visual de cada nivel
const claseNivel = {
  "Alfabetización": "badge-inicial",
  Primaria: "badge-intermedio",
  Secundaria: "badge-avanzado",
};

const puedeEditar = computed(() =>
  ["admin", "capturista"].includes(auth.rol)
);

const educandos = ref([]);
const filtroRfe = ref("");
const filtroNivel = ref("");
const mensaje = ref("");

// Formatear fecha evitando cambios por zona horaria
function formatearFecha(f) {
  return new Date(f).toLocaleDateString("es-MX", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Hojas por letra (A-Z + Ñ).
const LETRAS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const letraActiva = ref("A");

const letras = computed(() =>
  educandos.value.some((e) => e.letra === "#")
    ? [...LETRAS, "#"]
    : LETRAS
);

const educandosVisibles = computed(() =>
  educandos.value.filter((e) => e.letra === letraActiva.value)
);

const conteoPorLetra = computed(() => {
  const conteo = {};
  for (const e of educandos.value) {
    conteo[e.letra] = (conteo[e.letra] || 0) + 1;
  }
  return conteo;
});

// Misma regla que el backend: inicial del apellido paterno, sin acento.
function letraDe(apellido) {
  const c = (apellido || "").trim().charAt(0).toUpperCase();

  if (c === "Ñ") return "Ñ";

  const base = c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return /^[A-Z]$/.test(base) ? base : "#";
}

// Si la hoja activa quedó vacía, salta a la primera con registros.
function ajustarLetra() {
  if (educandos.value.some((e) => e.letra === letraActiva.value)) return;

  if (educandos.value[0]) letraActiva.value = educandos.value[0].letra;
}

const mostrarFormulario = ref(false);
const errorFormulario = ref("");

const nuevo = ref({
  apellido_paterno: "",
  apellido_materno: "",
  nombres: "",
  rfe: "",
  fecha_registro: "",
  nivel: "",
});

const educandoEditando = ref(null);
const errorEdicion = ref("");

const edicion = ref({
  apellido_paterno: "",
  apellido_materno: "",
  nombres: "",
  rfe: "",
  fecha_registro: "",
  nivel: "",
});

const educandoDocumentos = ref(null);
const inputArchivos = ref(null);
const archivosSeleccionados = ref([]);
const subiendo = ref(false);
const errorDocumentos = ref("");

async function cargar() {
  const { data } = await api.get("/educandos", {
    params: {
      rfe: filtroRfe.value || undefined,
      nivel: filtroNivel.value || undefined,
    },
  });

  educandos.value = data;
  ajustarLetra();
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

    letraActiva.value = letraDe(nuevo.value.apellido_paterno);

    mostrarFormulario.value = false;

    nuevo.value = {
      apellido_paterno: "",
      apellido_materno: "",
      nombres: "",
      rfe: "",
      fecha_registro: "",
      nivel: "",
    };

    mensaje.value = "Educando registrado correctamente";

    await cargar();
  } catch (err) {
    errorFormulario.value =
      err.response?.data?.mensaje || "No se pudo registrar el educando";
  }
}

async function eliminar(educando) {
  if (!confirm(`¿Dar de baja a ${educando.nombre}?`)) return;

  await api.delete(`/educandos/${educando._id}`);

  mensaje.value = "Educando dado de baja";

  await cargar();
}

async function reactivar(educando) {
  if (
    !confirm(
      `¿Reactivar a ${educando.nombre}? Volverá a su lugar en la lista con su número.`
    )
  )
    return;

  await api.put(`/educandos/${educando._id}/reactivar`);

  mensaje.value = "Educando reactivado";

  await cargar();
}

function abrirEdicion(educando) {
  errorEdicion.value = "";

  edicion.value = {
    apellido_paterno: educando.apellido_paterno,
    apellido_materno: educando.apellido_materno || "",
    nombres: educando.nombres,
    rfe: educando.rfe,
    fecha_registro: new Date(educando.fecha_registro)
      .toISOString()
      .slice(0, 10),
    nivel: educando.nivel,
  };

  educandoEditando.value = educando;
}

async function guardarEdicion() {
  errorEdicion.value = "";

  try {
    await api.put(
      `/educandos/${educandoEditando.value._id}`,
      edicion.value
    );

    letraActiva.value = letraDe(edicion.value.apellido_paterno);

    mensaje.value = "Educando actualizado correctamente";

    educandoEditando.value = null;

    await cargar();
  } catch (err) {
    errorEdicion.value =
      err.response?.data?.mensaje || "No se pudo actualizar el educando";
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
    const { data } = await api.post(
      `/educandos/${educandoDocumentos.value._id}/documentos`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    educandoDocumentos.value.documentos = data.documentos;

    archivosSeleccionados.value = [];

    if (inputArchivos.value) inputArchivos.value.value = "";

    await cargar();
  } catch (err) {
    errorDocumentos.value =
      err.response?.data?.mensaje || "No se pudieron subir los documentos";
  } finally {
    subiendo.value = false;
  }
}

async function eliminarDocumento(documento) {
  if (
    !confirm(`¿Eliminar el documento "${documento.nombre_archivo}"?`)
  )
    return;

  errorDocumentos.value = "";

  try {
    await api.delete(
      `/educandos/${educandoDocumentos.value._id}/documentos/${documento._id}`
    );

    educandoDocumentos.value.documentos =
      educandoDocumentos.value.documentos.filter(
        (d) => d._id !== documento._id
      );
  } catch (err) {
    errorDocumentos.value =
      err.response?.data?.mensaje || "No se pudo eliminar el documento";
  }
}

onMounted(cargar);
</script>