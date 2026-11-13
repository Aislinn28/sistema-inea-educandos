<template>
  <AuthLayout>
    <h1 class="text-3xl font-bold">Iniciar sesión</h1>
    <p class="mt-2 text-sm text-ink-muted">Ingresa tus credenciales para acceder al sistema.</p>

    <form @submit.prevent="entrar" class="mt-8 space-y-5">
      <div>
        <label for="correo" class="label">Correo electrónico</label>
        <div class="relative">
          <Icon name="mail" :size="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            id="correo"
            v-model="correo"
            type="email"
            required
            autocomplete="username"
            class="input pl-10"
            placeholder="tu_correo@inea.gob.mx"
          />
        </div>
      </div>

      <div>
        <label for="password" class="label">Contraseña</label>
        <div class="relative">
          <Icon name="lock" :size="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            id="password"
            v-model="password"
            :type="verPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            class="input px-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 icon-btn"
            :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            @click="verPassword = !verPassword"
          >
            <Icon :name="verPassword ? 'eye-off' : 'eye'" :size="18" />
          </button>
        </div>
      </div>

      <p v-if="error" class="aviso-error" role="alert">
        <Icon name="alert-circle" :size="18" class="mt-0.5 shrink-0" />
        <span>{{ error }}</span>
      </p>

      <button type="submit" :disabled="cargando" class="btn-primary w-full py-3">
        {{ cargando ? "Ingresando..." : "Iniciar sesión" }}
      </button>

      <div class="text-center">
        <RouterLink to="/restablecer-password" class="text-sm font-medium text-primary hover:underline">
          ¿Olvidaste tu contraseña?
        </RouterLink>
      </div>
    </form>

    <p class="mt-8 rounded-lg bg-surface px-4 py-3 text-center text-sm text-ink-muted">
      ¿No tienes acceso? Solicita tu cuenta al administrador del sistema.
    </p>
  </AuthLayout>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import AuthLayout from "../components/AuthLayout.vue";
import Icon from "../components/Icon.vue";

const correo = ref("");
const password = ref("");
const verPassword = ref(false);
const error = ref("");
const cargando = ref(false);

const auth = useAuthStore();
const router = useRouter();

async function entrar() {
  error.value = "";
  cargando.value = true;
  try {
    await auth.login(correo.value, password.value);
    router.push("/");
  } catch (err) {
    error.value = err.response?.data?.mensaje || "No se pudo iniciar sesión";
  } finally {
    cargando.value = false;
  }
}
</script>
