<template>
  <router-view v-if="!auth.estaAutenticado" />

  <div v-else class="flex min-h-screen bg-surface">
    <!-- Fondo oscuro del menú en móvil -->
    <div
      v-if="menuAbierto"
      class="fixed inset-0 z-30 bg-forest/50 lg:hidden"
      @click="menuAbierto = false"
    />

    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-forest text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
      :class="menuAbierto ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary">
          <Icon name="book" :size="20" />
        </div>
        <div>
          <p class="text-base font-bold leading-tight">SIGESE-INEA</p>
          <p class="text-xs text-white/60">Gestión de educandos</p>
        </div>
      </div>

      <nav class="flex-1 space-y-1 px-3 py-5" aria-label="Navegación principal">
        <RouterLink
          v-for="enlace in enlaces"
          :key="enlace.to"
          :to="enlace.to"
          class="nav-link"
          active-class="nav-link-activo"
          exact-active-class="nav-link-activo"
          @click="menuAbierto = false"
        >
          <Icon :name="enlace.icono" :size="20" />
          {{ enlace.texto }}
        </RouterLink>
      </nav>

      <div class="border-t border-white/10 p-3">
        <button
          @click="salir"
          class="nav-link w-full"
        >
          <Icon name="logout" :size="20" />
          Cerrar sesión
        </button>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-20 flex items-center gap-4 border-b border-line bg-white px-4 py-3.5 sm:px-8">
        <button
          class="icon-btn lg:hidden"
          aria-label="Abrir menú"
          @click="menuAbierto = true"
        >
          <Icon name="menu" :size="22" />
        </button>
        <h1 class="flex-1 truncate text-xl font-bold sm:text-2xl">{{ tituloPagina }}</h1>

        <div class="flex items-center gap-3">
          <div class="hidden text-right sm:block">
            <p class="text-sm font-semibold leading-tight">{{ auth.usuario?.nombre }}</p>
            <p class="text-xs text-ink-muted">{{ etiquetaRol }}</p>
          </div>
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary"
            aria-hidden="true"
          >
            {{ iniciales }}
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { RouterLink, RouterView, useRouter, useRoute } from "vue-router";
import { useAuthStore } from "./store/auth";
import Icon from "./components/Icon.vue";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const menuAbierto = ref(false);

const enlaces = computed(() => {
  const lista = [
    { to: "/", texto: "Dashboard", icono: "dashboard" },
    { to: "/educandos", texto: "Educandos", icono: "users" },
  ];
  if (auth.rol === "admin") {
    lista.push({ to: "/usuarios", texto: "Usuarios", icono: "shield" });
    lista.push({ to: "/historial", texto: "Historial", icono: "history" });
  }
  return lista;
});

const titulos = {
  dashboard: "Dashboard general",
  educandos: "Gestión de educandos",
  usuarios: "Usuarios",
  historial: "Historial de auditoría",
};
const tituloPagina = computed(() => titulos[route.name] || "SIGESE-INEA");

const roles = { admin: "Administrador", capturista: "Capturista", lectura: "Solo lectura" };
const etiquetaRol = computed(() => roles[auth.rol] || auth.rol);

const iniciales = computed(() => {
  const partes = (auth.usuario?.nombre || "").trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] || "") + (partes[1]?.[0] || "")).toUpperCase() || "U";
});

function salir() {
  auth.cerrarSesion();
  router.push("/login");
}
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.72);
  transition: background-color 0.15s ease, color 0.15s ease;
}
.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.07);
  color: #fff;
}
.nav-link-activo {
  background-color: #1b5e2f;
  color: #fff;
}
</style>
