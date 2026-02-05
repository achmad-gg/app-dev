<!-- ArticleItem.vue -->
<script setup>
import { useRouter } from 'vue-router'
import ArticleActions from './ArticleActions.vue'

defineProps({
  article: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const getStatusColor = (status) => {
  const colors = {
    published: 'bg-green-100 text-green-700 border-green-200',
    approved: 'bg-blue-100 text-blue-700 border-blue-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    rejected: 'bg-red-100 text-red-700 border-red-200'
  }
  return colors[status?.toLowerCase()] || colors.draft
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}
</script>

<template>
  <div class="group p-4 sm:p-6 hover:bg-gray-50 transition-colors">
    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Left: Article Info -->
      <div class="flex-1 min-w-0">
        <h3
          class="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
          @click="router.push(`/articles/${article.id}`)"
        >
          {{ article.title }}
        </h3>
        
        <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
          <span v-if="article.category_name" class="inline-flex items-center gap-1">
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {{ article.category_name }}
          </span>
          
          <span v-if="article.category_name" class="text-gray-300">•</span>
          
          <span class="inline-flex items-center gap-1">
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ formatDate(article.created_at) }}
          </span>
        </div>
      </div>

      <!-- Right: Status & Actions -->
      <div class="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <span
          :class="getStatusColor(article.status)"
          class="px-3 py-1.5 text-xs font-semibold rounded-full border capitalize whitespace-nowrap"
        >
          {{ article.status }}
        </span>

        <ArticleActions :article="article" />
      </div>
    </div>
  </div>
</template>