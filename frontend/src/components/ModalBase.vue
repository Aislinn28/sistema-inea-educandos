<template>
  <div
    class="fixed inset-0 z-50 !m-0 flex items-center justify-center bg-forest/50 px-4 py-6 backdrop-blur-[2px]"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex max-h-full w-full flex-col rounded-2xl bg-white shadow-modal"
      :class="ancho"
    >
      <header class="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div class="min-w-0">
          <h3 class="text-lg">{{ titulo }}</h3>
          <p v-if="subtitulo" class="mt-0.5 truncate text-sm text-ink-muted">{{ subtitulo }}</p>
        </div>
        <button type="button" class="icon-btn -mr-2" aria-label="Cerrar" @click="$emit('cerrar')">
          <Icon name="x" :size="18" />
        </button>
      </header>
      <div class="overflow-y-auto px-6 py-5">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import Icon from "./Icon.vue";

defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: "" },
  ancho: { type: String, default: "max-w-xl" },
});
defineEmits(["cerrar"]);
</script>
