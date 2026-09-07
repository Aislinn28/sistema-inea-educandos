<template>
  <div class="min-h-screen flex items-center justify-center bg-primary px-4">
    <div class="w-full max-w-sm bg-paper rounded-lg shadow-xl overflow-hidden">
      <div class="bg-primary-dark px-8 py-6">
        <h1 class="font-serif text-white text-xl">Recuperar contraseña</h1>
      </div>

      <div v-if="!token" class="px-8 py-8 space-y-5">
        <p class="text-sm text-ink/70">
          Escribe tu correo y te mandaremos un enlace para restablecer tu contraseña.
        </p>
        <form @submit.prevent="solicitar" class="space-y-4">
          <input
            v-model="correo"
            type="email"
            required
            placeholder="tu_correo@inea.gob.mx"
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            :disabled="cargando"
            class="w-full bg-accent hover:bg-accent-dark transition-colors text-white font-medium py-2.5 rounded disabled:opacity-60"
          >
            {{ cargando ? "Enviando..." : "Enviar enlace" }}
          </button>
        </form>
        <p v-if="mensaje" class="text-success text-sm">{{ mensaje }}</p>
      </div>

      <div v-else class="px-8 py-8 space-y-5">
        <form @submit.prevent="restablecer" class="space-y-4">
          <input
            v-model="nuevaPassword"
            type="password"
            required
            minlength="8"
            placeholder="Nueva contraseña"
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            :disabled="cargando"
            class="w-full bg-accent hover:bg-accent-dark transition-colors text-white font-medium py-2.5 rounded disabled:opacity-60"
          >
            {{ cargando ? "Guardando..." : "Restablecer contraseña" }}
          </button>
        </form>
        <p v-if="mensaje" class="text-success text-sm">{{ mensaje }}</p>
        <p v-if="error" class="text-danger text-sm">{{ error }}</p>
      </div>

      <div class="px-8 pb-6">
        <RouterLink to="/login" class="text-sm text-primary hover:underline">
          Volver al inicio de sesión
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import api from "../services/api";

const route = useRoute();
const token = route.params.token; // coincide con el enlace que manda el backend: /restablecer-password/:token

const correo = ref("");
const nuevaPassword = ref("");
const mensaje = ref("");
const error = ref("");
const cargando = ref(false);

async function solicitar() {
  mensaje.value = "";
  cargando.value = true;
  try {
    const { data } = await api.post("/auth/recuperar", { correo: correo.value });
    mensaje.value = data.mensaje;
  } catch (err) {
    error.value = err.response?.data?.mensaje || "Ocurrió un error";
  } finally {
    cargando.value = false;
  }
}

async function restablecer() {
  mensaje.value = "";
  error.value = "";
  cargando.value = true;
  try {
    const { data } = await api.post(`/auth/restablecer/${token}`, {
      password: nuevaPassword.value,
    });
    mensaje.value = data.mensaje;
  } catch (err) {
    error.value = err.response?.data?.mensaje || "El enlace es inválido o ya expiró";
  } finally {
    cargando.value = false;
  }
}
</script>
