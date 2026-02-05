<script setup>
import { onMounted } from 'vue'
import { useCategoryStore } from '../stores/category.store'

const categoryStore = useCategoryStore()

defineProps({
  modelValue: Number,
})

const emit = defineEmits(['update:modelValue'])

onMounted(() => {
  if (!categoryStore.categories.length) {
    categoryStore.fetchCategories()
  }
})
</script>

<template>
  <div class="relative">
    <select
      :value="modelValue"
      @change="emit('update:modelValue', Number($event.target.value))"
      class="w-full sm:w-64 appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
    >
      <option value="" class="text-gray-500">All Categories</option>
      <option
        v-for="cat in categoryStore.categories"
        :key="cat.id"
        :value="cat.id"
        class="text-gray-900"
      >
        {{ cat.name }}
      </option>
    </select>

    <!-- Custom Dropdown Icon -->
    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Category Icon (optional) -->
    <!-- <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    </div> -->
  </div>
</template>

<style scoped>
/* Hide default select arrow in IE */
@reference "..//main.css";
select::-ms-expand {
  display: none;
}
</style>