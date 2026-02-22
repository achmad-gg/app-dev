<script setup>
import { onMounted } from 'vue'
import { useCategoryStore } from '@/stores/category.store'

defineProps({
  modelValue: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const categoryStore = useCategoryStore()

onMounted(() => {
  categoryStore.fetchCategories()
})

const onChange = (e) => {
  const value = e.target.value
  emit('update:modelValue', value === '' ? null : Number(value))
}
</script>

<template>
  <div class="relative">
    <select
      class="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all cursor-pointer hover:border-gray-300"
      :value="modelValue === null ? '' : modelValue"
      @change="onChange"
    >
      <option value="">All Categories</option>
      <option v-for="c in categoryStore.categories" :key="c.id" :value="c.id">
        {{ c.name }}
      </option>
    </select>
    <!-- Custom arrow -->
    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</template>
