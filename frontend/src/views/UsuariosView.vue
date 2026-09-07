<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl mb-1">Usuarios</h2>
        <p class="text-ink/60 text-sm">Correos con acceso al sistema</p>
      </div>
      <button
        @click="mostrarFormulario = true"
        class="text-sm bg-accent text-white px-4 py-2 rounded hover:bg-accent-dark transition-colors"
      >
        + Nuevo usuario
      </button>
    </div>

    <p v-if="mensaje" class="text-success text-sm mb-3">{{ mensaje }}</p>
    <p v-if="errorLista" class="text-danger text-sm mb-3">{{ errorLista }}</p>

    <table class="tabla-expediente">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Rol</th>
          <th>Estatus</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in usuarios" :key="u._id">
          <td>{{ u.nombre }}</td>
          <td>{{ u.correo }}</td>
          <td class="capitalize">{{ u.rol }}</td>
          <td>
            <span :class="u.activo ? 'text-success' : 'text-danger'">
              {{ u.activo ? "Activo" : "Dado de baja" }}
            </span>
          </td>
          <td class="space-x-3">
            <button @click="abrirEdicion(u)" class="text-primary hover:underline">Editar</button>
            <button
              v-if="u.activo"
              @click="cambiarEstatus(u, false)"
              class="text-danger hover:underline"
            >
              Dar de baja
            </button>
            <button v-else @click="cambiarEstatus(u, true)" class="text-success hover:underline">
              Reactivar
            </button>
          </td>
        </tr>
        <tr v-if="usuarios.length === 0">
          <td colspan="5" class="text-center text-ink/50 py-6">No hay usuarios registrados</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal: nuevo usuario -->
    <div v-if="mostrarFormulario" class="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg w-full max-w-md p-6">
        <h3 class="text-lg mb-4">Nuevo usuario</h3>
        <form @submit.prevent="crear" class="space-y-4">
          <input
            v-model="nuevo.nombre"
            required
            placeholder="Nombre completo"
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm"
          />
          <input
            v-model="nuevo.correo"
            type="email"
            required
            placeholder="Correo institucional"
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm"
          />
          <input
            v-model="nuevo.password"
            type="password"
            required
            minlength="8"
            placeholder="Contraseña temporal"
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm"
          />
          <select v-model="nuevo.rol" required class="w-full border border-ink/20 rounded px-3 py-2 text-sm">
            <option disabled value="">Selecciona un rol</option>
            <option value="capturista">Capturista</option>
            <option value="lectura">Solo lectura</option>
          </select>

          <p v-if="error" class="text-danger text-sm">{{ error }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="mostrarFormulario = false" class="text-sm text-ink/60">
              Cancelar
            </button>
            <button type="submit" class="text-sm bg-primary text-white px-4 py-2 rounded">Crear</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: editar usuario -->
    <div v-if="usuarioEditando" class="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg w-full max-w-md p-6">
        <h3 class="text-lg mb-4">Editar usuario</h3>
        <form @submit.prevent="guardarEdicion" class="space-y-4">
          <input
            v-model="edicion.nombre"
            required
            placeholder="Nombre completo"
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm"
          />
          <input
            v-model="edicion.correo"
            type="email"
            required
            placeholder="Correo institucional"
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm"
          />
          <select v-model="edicion.rol" required class="w-full border border-ink/20 rounded px-3 py-2 text-sm">
            <option value="admin">Administrador</option>
            <option value="capturista">Capturista</option>
            <option value="lectura">Solo lectura</option>
          </select>

          <p v-if="errorEdicion" class="text-danger text-sm">{{ errorEdicion }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="usuarioEditando = null" class="text-sm text-ink/60">
              Cancelar
            </button>
            <button type="submit" class="text-sm bg-primary text-white px-4 py-2 rounded">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

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

onMounted(cargar);
</script>
