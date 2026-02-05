<!-- ArticlePagination.vue -->
<script setup>
import { useMyArticleStore } from '@/stores/myArticle.store'

const store = useMyArticleStore()

const prevPage = () => {
  if (store.pagination.page > 1) {
    store.setPage(store.pagination.page - 1)
    scrollToTop()
  }
}

const nextPage = () => {
  if (store.pagination.page < store.totalPages) {
    store.setPage(store.pagination.page + 1)
    scrollToTop()
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
    <button
      @click="prevPage"
      :disabled="store.pagination.page <= 1"
      class="group flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm border border-gray-200"
    >
      <svg 
        class="w-5 h-5 transition-transform group-hover:-translate-x-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Previous
    </button>

    <div class="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl shadow-sm border border-gray-200">
      <span class="text-sm text-gray-600">Page</span>
      <span class="text-lg font-bold text-gray-900">{{ store.pagination.page }}</span>
      <span class="text-sm text-gray-400">of</span>
      <span class="text-lg font-bold text-gray-900">{{ store.totalPages }}</span>
    </div>

    <button
      @click="nextPage"
      :disabled="store.pagination.page >= store.totalPages"
      class="group flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm border border-gray-200"
    >
      Next
      <svg 
        class="w-5 h-5 transition-transform group-hover:translate-x-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>