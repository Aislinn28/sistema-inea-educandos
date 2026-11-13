<template>
  <div class="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
    <!-- Panel de marca -->
    <aside class="relative hidden flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex">
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
          <Icon name="book" :size="22" />
        </div>
        <div>
          <p class="text-xl font-bold leading-tight">SIGESE-INEA</p>
          <p class="text-sm text-white/60">Sistema de Gestión y Seguimiento de Expedientes</p>
        </div>
      </div>

      <!-- Vista previa de un expediente -->
      <div class="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-navy-light p-6 shadow-modal">
        <div class="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p class="font-semibold">Expediente del educando</p>
            <p class="mt-0.5 text-sm text-white/50">Registro, documentos y seguimiento</p>
          </div>
          <span class="rounded-md bg-nivel-avanzado-bg px-2 py-0.5 text-xs font-medium text-nivel-avanzado">
            Activo
          </span>
        </div>
        <ul class="mt-5 space-y-4 text-sm">
          <li class="flex items-center gap-3">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
              <Icon name="users" :size="16" />
            </span>
            <span class="flex-1">Datos personales y RFE</span>
            <span class="text-xs text-emerald-300">Registrado</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
              <Icon name="folder" :size="16" />
            </span>
            <span class="flex-1">Expediente digitalizado</span>
            <span class="text-xs text-emerald-300">En la nube</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sky-300">
              <Icon name="layers" :size="16" />
            </span>
            <span class="flex-1">Nivel educativo</span>
            <span class="text-xs text-sky-300">Alfabetización  · Primaria · Secundaria</span>
          </li>
        </ul>
      </div>

      <div>
        <h2 class="max-w-lg text-2xl font-bold leading-snug text-white">
          Expedientes de educandos en un solo lugar, con trazabilidad en cada cambio.
        </h2>
        <p class="mt-3 max-w-lg text-sm leading-relaxed text-white/60">
          Registra educandos, resguarda sus documentos y consulta quién modificó cada expediente.
        </p>
      </div>
    </aside>

    <!-- Contenido -->
    <main class="flex items-center justify-center bg-white px-6 py-12 sm:px-12">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Icon name="book" :size="20" />
          </div>
          <p class="text-lg font-bold">SIGESE-INEA</p>
        </div>
        <slot />
        <p class="mt-10 text-center text-xs text-ink-muted">
          SIGESE-INEA · Instituto Nacional para la Educación de los Adultos
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import Icon from "./Icon.vue";
</script>
