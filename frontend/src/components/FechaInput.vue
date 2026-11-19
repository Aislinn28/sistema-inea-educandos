<template>
  <input ref="el" :id="id" :required="required" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import flatpickr from "flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import "flatpickr/dist/flatpickr.min.css";

const props = defineProps({ modelValue: String, id: String, required: Boolean });
const emit = defineEmits(["update:modelValue"]);
const el = ref(null);
let fp;

onMounted(() => {
  fp = flatpickr(el.value, {
    locale: Spanish,
    dateFormat: "Y-m-d",   // lo que se guarda y se manda al backend
    altInput: true,
    altFormat: "d/m/Y",    // lo que ve la persona
    altInputClass: "input",
    defaultDate: props.modelValue || null,
    onChange: (_, valor) => emit("update:modelValue", valor),
  });
});

watch(() => props.modelValue, (v) => {
  if (fp && v !== fp.input.value) fp.setDate(v || null, false);
});

onBeforeUnmount(() => fp?.destroy());
</script>