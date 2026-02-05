<!-- ArticleEmpty.vue -->
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMyArticleStore } from '@/stores/myArticle.store'

const router = useRouter()
const store = useMyArticleStore()

const title = computed(() => {
  const status = store.filters.status
  if (status === 'draft') return 'No draft articles'
  if (status === 'published') return 'No published articles'
  if (status === 'approved') return 'No approved articles'
  if (status === 'pending') return 'No pending articles'
  if (status === 'rejected') return 'No rejected articles'
  return 'No articles yet'
})

const description = computed(() => {
  const status = store.filters.status
  if (status) {
    return 'Try changing the filter or start writing a new article.'
  }
  return 'Start your writing journey by creating your first article. Share your thoughts, stories, and expertise with the world.'
})

const goToWrite = () => {
  router.push('/write')
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
    <div class="max-w-md mx-auto">
      <!-- Icon -->
      <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      <!-- Title -->
      <h3 class="text-2xl font-bold text-gray-900 mb-3">
        {{ title }}
      </h3>

      <!-- Description -->
      <p class="text-gray-600 mb-8">
        {{ description }}
      </p>

      <!-- CTA Button -->
      <button
        @click="goToWrite"
        class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Write Your First Article
      </button>

      <!-- Help Text -->
      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          Need inspiration? Check out our 
          <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">writing guide</a>
          to get started.
        </p>
      </div>
    </div>
  </div>
</template>