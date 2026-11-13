<template>
  <AuthLayout>
    <RouterLink
      to="/login"
      class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
    >
      <Icon name="arrow-left" :size="16" />
      Volver al inicio de sesión
    </RouterLink>

    <h1 class="text-3xl font-bold">Recuperar contraseña</h1>

    <div v-if="!token" class="mt-2">
      <p class="text-sm text-ink-muted">
        Escribe tu correo y te mandaremos un enlace para restablecer tu contraseña.
      </p>
      <form @submit.prevent="solicitar" class="mt-8 space-y-5">
        <div>
          <label for="correo" class="label">Correo electrónico</label>
          <div class="relative">
            <Icon name="mail" :size="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="correo"
              v-model="correo"
              type="email"
              required
              placeholder="tu_correo@inea.gob.mx"
              class="input pl-10"
            />
          </div>
        </div>
        <p v-if="mensaje" class="aviso-ok" role="status">
          <Icon name="check-circle" :size="18" class="mt-0.5 shrink-0" />
          <span>{{ mensaje }}</span>
        </p>
        <p v-if="error" class="aviso-error" role="alert">
          <Icon name="alert-circle" :size="18" class="mt-0.5 shrink-0" />
          <span>{{ error }}</span>
        </p>
        <button type="submit" :disabled="cargando" class="btn-primary w-full py-3">
          {{ cargando ? "Enviando..." : "Enviar enlace" }}
        </button>
      </form>
    </div>

    <div v-else class="mt-2">
      <p class="text-sm text-ink-muted">Elige una nueva contraseña de al menos 8 caracteres.</p>
      <form @submit.prevent="restablecer" class="mt-8 space-y-5">
        <div>
          <label for="nueva" class="label">Nueva contraseña</label>
          <div class="relative">
            <Icon name="lock" :size="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="nueva"
              v-model="nuevaPassword"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
              placeholder="Nueva contraseña"
              class="input pl-10"
            />
          </div>
        </div>
        <p v-if="mensaje" class="aviso-ok" role="status">
          <Icon name="check-circle" :size="18" class="mt-0.5 shrink-0" />
          <span>{{ mensaje }}</span>
        </p>
        <p v-if="error" class="aviso-error" role="alert">
          <Icon name="alert-circle" :size="18" class="mt-0.5 shrink-0" />
          <span>{{ error }}</span>
        </p>
        <button type="submit" :disabled="cargando" class="btn-primary w-full py-3">
          {{ cargando ? "Guardando..." : "Restablecer contraseña" }}
        </button>
      </form>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout.vue";
import Icon from "../components/Icon.vue";

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
