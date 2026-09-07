<template>
  <router-view v-if="!auth.estaAutenticado" />

  <div v-else class="flex min-h-screen bg-paper">
    <aside class="w-64 bg-primary text-white flex flex-col shrink-0">
      <div class="px-6 py-6 border-b border-white/10">
        <h1 class="font-serif text-lg leading-snug">Sistema INEA</h1>
        <p class="text-xs text-white/60 mt-1">Gestión de Educandos</p>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1">
        <RouterLink to="/" class="nav-link" active-class="nav-link-activo">Dashboard</RouterLink>
        <RouterLink to="/educandos" class="nav-link" active-class="nav-link-activo">Educandos</RouterLink>
        <RouterLink
          v-if="auth.rol === 'admin'"
          to="/usuarios"
          class="nav-link"
          active-class="nav-link-activo"
        >
          Usuarios
        </RouterLink>
        <RouterLink
          v-if="auth.rol === 'admin'"
          to="/historial"
          class="nav-link"
          active-class="nav-link-activo"
        >
          Historial
        </RouterLink>
      </nav>

      <div class="px-6 py-4 border-t border-white/10">
        <p class="text-sm font-medium">{{ auth.usuario?.nombre }}</p>
        <p class="text-xs text-white/60 capitalize mb-3">{{ auth.rol }}</p>
        <button @click="salir" class="text-sm text-accent hover:text-accent-dark transition-colors">
          Cerrar sesión
        </button>
      </div>
    </aside>

    <main class="flex-1 p-8 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from "./store/auth";

const auth = useAuthStore();
const router = useRouter();

function salir() {
  auth.cerrarSesion();
  router.push("/login");
}
</script>

<style scoped>
.nav-link {
  display: block;
  padding: 0.55rem 0.9rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
  transition: background-color 0.15s ease;
}
.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
}
.nav-link-activo {
  background-color: rgba(255, 255, 255, 0.12);
  color: white;
  font-weight: 500;
}
</style>
