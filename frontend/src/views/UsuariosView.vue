<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <p class="text-sm text-ink-muted">Correos con acceso al sistema.</p>
      <button @click="mostrarFormulario = true" class="btn-primary">
        <Icon name="plus" :size="18" />
        Nuevo usuario
      </button>
    </div>

    <p v-if="mensaje" class="aviso-ok" role="status">
      <Icon name="check-circle" :size="18" class="mt-0.5 shrink-0" />
      <span>{{ mensaje }}</span>
    </p>
    <p v-if="errorLista" class="aviso-error" role="alert">
      <Icon name="alert-circle" :size="18" class="mt-0.5 shrink-0" />
      <span>{{ errorLista }}</span>
    </p>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estatus</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u._id">
              <td>
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary"
                    aria-hidden="true"
                  >
                    {{ iniciales(u.nombre) }}
                  </span>
                  <span class="font-medium text-ink">{{ u.nombre }}</span>
                </div>
              </td>
              <td>{{ u.correo }}</td>
              <td>
                <span class="badge bg-surface text-ink-soft capitalize">{{ u.rol }}</span>
              </td>
              <td>
                <span
                  class="badge"
                  :class="u.activo ? 'bg-nivel-avanzado-bg text-nivel-avanzado' : 'bg-danger-50 text-danger'"
                >
                  {{ u.activo ? "Activo" : "Dado de baja" }}
                </span>
              </td>
              <td>
                <div class="flex justify-end gap-1">
                  <button @click="abrirEdicion(u)" class="icon-btn" title="Editar" aria-label="Editar usuario">
                    <Icon name="pencil" :size="17" />
                  </button>
                  <button
                    v-if="u.activo"
                    @click="cambiarEstatus(u, false)"
                    class="icon-btn icon-btn-danger"
                    title="Dar de baja"
                    aria-label="Dar de baja usuario"
                  >
                    <Icon name="trash" :size="17" />
                  </button>
                  <button
                    v-else
                    @click="cambiarEstatus(u, true)"
                    class="icon-btn hover:bg-primary-50 hover:text-primary"
                    title="Reactivar"
                    aria-label="Reactivar usuario"
                  >
                    <Icon name="check-circle" :size="17" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="usuarios.length === 0">
              <td colspan="5" class="py-12 text-center text-ink-muted">No hay usuarios registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: nuevo usuario -->
    <ModalBase v-if="mostrarFormulario" titulo="Nuevo usuario" subtitulo="Crea una cuenta con acceso al sistema" @cerrar="mostrarFormulario = false">
      <form @submit.prevent="crear" class="space-y-4">
        <div>
          <label for="nu-nombre" class="label">Nombre completo</label>
          <input id="nu-nombre" v-model="nuevo.nombre" required placeholder="Nombre completo" class="input" />
        </div>
        <div>
          <label for="nu-correo" class="label">Correo institucional</label>
          <input id="nu-correo" v-model="nuevo.correo" type="email" required placeholder="Correo institucional" class="input" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="nu-pass" class="label">Contraseña temporal</label>
            <input
              id="nu-pass"
              v-model="nuevo.password"
              type="password"
              required
              minlength="8"
              placeholder="Mínimo 8 caracteres"
              class="input"
            />
          </div>
          <div>
            <label for="nu-rol" class="label">Rol</label>
            <select id="nu-rol" v-model="nuevo.rol" required class="input">
              <option disabled value="">Selecciona un rol</option>
              <option value="capturista">Capturista</option>
              <option value="lectura">Solo lectura</option>
            </select>
          </div>
        </div>

        <p v-if="error" class="aviso-error" role="alert">
          <Icon name="alert-circle" :size="18" class="mt-0.5 shrink-0" />
          <span>{{ error }}</span>
        </p>

        <div class="flex justify-end gap-3 border-t border-line pt-4">
          <button type="button" @click="mostrarFormulario = false" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary">Crear</button>
        </div>
      </form>
    </ModalBase>

    <!-- Modal: editar usuario -->
    <ModalBase v-if="usuarioEditando" titulo="Editar usuario" :subtitulo="usuarioEditando.correo" @cerrar="usuarioEditando = null">
      <form @submit.prevent="guardarEdicion" class="space-y-4">
        <div>
          <label for="eu-nombre" class="label">Nombre completo</label>
          <input id="eu-nombre" v-model="edicion.nombre" required placeholder="Nombre completo" class="input" />
        </div>
        <div>
          <label for="eu-correo" class="label">Correo institucional</label>
          <input id="eu-correo" v-model="edicion.correo" type="email" required placeholder="Correo institucional" class="input" />
        </div>
        <div>
          <label for="eu-rol" class="label">Rol</label>
          <select id="eu-rol" v-model="edicion.rol" required class="input">
            <option value="admin">Administrador</option>
            <option value="capturista">Capturista</option>
            <option value="lectura">Solo lectura</option>
          </select>
        </div>

        <p v-if="errorEdicion" class="aviso-error" role="alert">
          <Icon name="alert-circle" :size="18" class="mt-0.5 shrink-0" />
          <span>{{ errorEdicion }}</span>
        </p>

        <div class="flex justify-end gap-3 border-t border-line pt-4">
          <button type="button" @click="usuarioEditando = null" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary">Guardar cambios</button>
        </div>
      </form>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";
import Icon from "../components/Icon.vue";
import ModalBase from "../components/ModalBase.vue";

const usuarios = ref([]);
const mensaje = ref("");
const error = ref("");
const errorLista = ref("");

const mostrarFormulario = ref(false);
const nuevo = ref({ nombre: "", correo: "", password: "", rol: "" });

const usuarioEditando = ref(null);
const errorEdicion = ref("");
const edicion = ref({ nombre: "", correo: "", rol: "" });

async function cargar() {
  errorLista.value = "";
  try {
    const { data } = await api.get("/auth/usuarios");
    usuarios.value = data;
  } catch (err) {
    errorLista.value = err.response?.data?.mensaje || "No se pudo obtener la lista de usuarios";
  }
}

async function crear() {
  error.value = "";
  try {
    await api.post("/auth/usuarios", nuevo.value);
    mensaje.value = `Usuario ${nuevo.value.correo} creado correctamente`;
    nuevo.value = { nombre: "", correo: "", password: "", rol: "" };
    mostrarFormulario.value = false;
    await cargar();
  } catch (err) {
    error.value = err.response?.data?.mensaje || "No se pudo crear el usuario";
  }
}

function abrirEdicion(usuario) {
  errorEdicion.value = "";
  edicion.value = { nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol };
  usuarioEditando.value = usuario;
}

async function guardarEdicion() {
  errorEdicion.value = "";
  try {
    await api.put(`/auth/usuarios/${usuarioEditando.value._id}`, edicion.value);
    mensaje.value = "Usuario actualizado correctamente";
    usuarioEditando.value = null;
    await cargar();
  } catch (err) {
    errorEdicion.value = err.response?.data?.mensaje || "No se pudo actualizar el usuario";
  }
}

async function cambiarEstatus(usuario, activo) {
  const accion = activo ? "reactivar" : "dar de baja a";
  if (!confirm(`¿Quieres ${accion} a ${usuario.nombre}?`)) return;

  try {
    await api.patch(`/auth/usuarios/${usuario._id}/estatus`, { activo });
    mensaje.value = activo ? "Usuario reactivado" : "Usuario dado de baja";
    await cargar();
  } catch (err) {
    errorLista.value = err.response?.data?.mensaje || "No se pudo actualizar el estatus del usuario";
  }
}

// Solo presentación: iniciales para el avatar
function iniciales(nombre) {
  const partes = (nombre || "").trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] || "") + (partes[1]?.[0] || "")).toUpperCase() || "U";
}

onMounted(cargar);
</script>
