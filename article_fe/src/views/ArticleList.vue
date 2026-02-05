<script setup>
import { onMounted, ref, watch } from 'vue'
import { useArticleStore } from '../stores/article.store'
import ArticleCard from '../components/ArticleCard.vue'
import CategorySelect from '../components/CategorySelect.vue'

const articleStore = useArticleStore()
const categoryId = ref(null)

onMounted(() => {
  articleStore.fetchArticles()
})

watch(categoryId, (val) => {
  articleStore.setPage(1)
  articleStore.fetchArticles({ category_id: val })
})

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const prevPage = () => {
  // Panggil method prevPage dari store Anda
  articleStore.prevPage()
  scrollToTop()
}

const nextPage = () => {
  // Panggil method nextPage dari store Anda
  articleStore.nextPage()
  scrollToTop()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- Header Section -->
      <div class="mb-8 sm:mb-12">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Articles</h1>
            <p class="mt-2 text-sm sm:text-base text-gray-600">
              Discover our latest stories and insights
            </p>
          </div>
          <div class="w-full sm:w-auto">
            <CategorySelect v-model="categoryId" />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="articleStore.loading.list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="group bg-white rounded-2xl overflow-hidden shadow-sm">
          <div class="h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
          <div class="p-6 space-y-3">
            <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div class="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
            <div class="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
          </div>
        </div>
      </div>

      <!-- Articles Grid -->
      <div v-else-if="articleStore.articles?.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ArticleCard
            v-for="article in articleStore.articles"
            :key="article.id"
            :article="article"
            class="transform transition-all duration-300 hover:scale-[1.02]"
          />
        </div>

        <!-- Pagination Controls -->
        <div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            @click="prevPage"
            :disabled="articleStore.pagination.page <= 1"
            class="group flex items-center gap-2 px-3 py-3 bg-white text-gray-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm border border-gray-200"
          >
            <svg
              class="w-5 h-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>

          <div
            class="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <span class="text-sm text-gray-600">Page</span>
            <span class="text-md font-bold text-gray-900">{{ articleStore.pagination.page }}</span>
          </div>

          <button
            @click="nextPage"
            :disabled="articleStore.articles?.length < articleStore.pagination.limit"
            class="group flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm border border-gray-200"
          >
            Next
            <svg
              class="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-16 sm:py-24">
        <div
          class="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center mb-6"
        >
          <svg
            class="w-12 h-12 sm:w-16 sm:h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">No articles found</h3>
        <p class="text-gray-600 text-center max-w-md">
          We couldn't find any articles matching your criteria. Try selecting a different category.
        </p>
      </div>
    </div>
  </div>
</template>
