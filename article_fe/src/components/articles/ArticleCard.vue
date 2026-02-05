<!-- ArticleCard.vue - New Component for Card Layout -->
<script setup>
import { useRouter } from 'vue-router'
import { useMyArticleStore } from '@/stores/myArticle.store'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const store = useMyArticleStore()

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

const viewArticle = () => {
  router.push(`/articles/${props.article.id}`)
}

const editArticle = () => {
  router.push(`/write/${props.article.id}`)
}

const deleteArticle = async () => {
  if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
    try {
      await store.deleteArticle(props.article.id)
    } catch (error) {
      console.error('Failed to delete article:', error)
    }
  }
}
</script>

<template>
  <div class="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
    <!-- Thumbnail -->
    <div class="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      <svg class="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      
      <!-- Status Badge -->
      <div class="absolute top-3 right-3">
        <span 
          :class="getStatusColor(article.status)"
          class="px-3 py-1 text-xs font-semibold rounded-full border capitalize"
        >
          {{ article.status }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5">
      <!-- Category -->
      <div class="flex items-center gap-2 mb-2">
        <span v-if="article.category_name" class="inline-flex items-center gap-1 text-xs text-gray-600">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {{ article.category_name }}
        </span>
      </div>

      <!-- Title -->
      <h3 
        class="font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer group-hover:text-blue-600 transition-colors"
        @click="viewArticle"
      >
        {{ article.title }}
      </h3>

      <!-- Excerpt (jika ada) -->
      <p v-if="article.content" class="text-sm text-gray-600 line-clamp-2 mb-4">
        {{ article.content.substring(0, 100) }}...
      </p>

      <!-- Meta Info -->
      <div class="flex items-center gap-3 text-xs text-gray-500 mb-4">
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formatDate(article.created_at) }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 pt-3 border-t border-gray-100">
        <button
          @click="viewArticle"
          class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>
        <button
          @click="editArticle"
          class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          @click="deleteArticle"
          class="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>