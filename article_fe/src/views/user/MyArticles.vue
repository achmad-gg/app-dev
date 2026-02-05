<!-- MyArticles.vue -->
<script setup>
import { onMounted } from 'vue'
import { useMyArticleStore } from '@/stores/myArticle.store'

import ArticleToolbar from '@/components/articles/ArticleToolbar.vue'
import ArticleList from '@/components/articles/ArticleList.vue'
import ArticlePagination from '@/components/articles/ArtilcePagination.vue'
import ArticleEmpty from '@/components/articles/ArticleEmpty.vue'

const store = useMyArticleStore()

onMounted(() => {
  store.fetchMyArticles()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      <!-- Header -->
      <header class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              My Articles
            </h1>
            <p class="mt-2 text-sm sm:text-base text-gray-600">
              Manage your drafts and published content
            </p>
          </div>
          
          <!-- Quick Stats -->
          <div class="flex gap-4">
            <div class="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200">
              <div class="text-2xl font-bold text-gray-900">
                {{ store.pagination.total }}
              </div>
              <div class="text-xs text-gray-600">Total Articles</div>
            </div>
          </div>
        </div>
      </header>

      <!-- Toolbar -->
      <ArticleToolbar />

      <!-- Loading State -->
      <div v-if="store.loading.list" class="space-y-4 mt-6">
        <div v-for="n in 5" :key="n" class="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
          <div class="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty State -->
      <ArticleEmpty v-else-if="store.isEmpty" />

      <!-- Articles List -->
      <ArticleList v-else />

      <!-- Pagination -->
      <ArticlePagination v-if="!store.loading.list && !store.isEmpty" />

    </div>
  </div>
</template>