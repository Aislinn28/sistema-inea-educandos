<template>
  <div class="min-h-screen flex items-center justify-center bg-primary px-4">
    <div class="w-full max-w-sm bg-paper rounded-lg shadow-xl overflow-hidden">
      <div class="bg-primary-dark px-8 py-6">
        <h1 class="font-serif text-white text-xl">Sistema INEA</h1>
        <p class="text-white/60 text-sm mt-1">Gestión y Seguimiento de Educandos</p>
      </div>

      <form @submit.prevent="entrar" class="px-8 py-8 space-y-5">
        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Correo</label>
          <input
            v-model="correo"
            type="email"
            required
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            placeholder="tu_correo@inea.gob.mx"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-ink mb-1.5">Contraseña</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full border border-ink/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            placeholder="••••••••"
          />
        </div>

        <p v-if="error" class="text-danger text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="cargando"
          class="w-full bg-accent hover:bg-accent-dark transition-colors text-white font-medium py-2.5 rounded disabled:opacity-60"
        >
          {{ cargando ? "Ingresando..." : "Iniciar sesión" }}
        </button>

        <RouterLink to="/restablecer-password" class="block text-center text-sm text-primary hover:underline">
          ¿Olvidaste tu contraseña?
        </RouterLink>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const correo = ref("");
const password = ref("");
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
