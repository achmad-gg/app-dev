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
  <select
    class="border rounded px-3 py-2"
    :value="modelValue === null ? '' : modelValue"
    @change="onChange"
  >
    <option value="">All Categories</option>

    <option v-for="c in categoryStore.categories" :key="c.id" :value="c.id">
      {{ c.name }}
    </option>
  </select>
</template>
