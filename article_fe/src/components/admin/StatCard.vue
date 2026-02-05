<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  highlight: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div
    class="rounded-lg border p-4 bg-white"
    :class="highlight
      ? 'border-yellow-400 bg-yellow-50'
      : 'border-gray-200'"
  >
    <p class="text-xs text-gray-500 uppercase tracking-wide">
      {{ label }}
    </p>

    <p
      class="mt-2 text-2xl font-semibold"
      :class="highlight
        ? 'text-yellow-700'
        : 'text-gray-800'"
    >
      {{ value }}
    </p>
  </div>
</template>
