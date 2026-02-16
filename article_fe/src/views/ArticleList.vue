<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useArticleStore } from '../stores/article.store'
import ArticleCard from '../components/ArticleCard.vue'
import CategorySelect from '../components/CategorySelect.vue'
import debounce from 'lodash.debounce'

const articleStore = useArticleStore()
const categoryId = ref(null)
const keyword = ref('')

// Computed properties
const totalResults = computed(() => articleStore.articles?.length || 0)
const hasFilters = computed(() => keyword.value || categoryId.value)
const isLastPage = computed(() => {
  const { page, limit, total } = articleStore.pagination
  return page * limit >= total
})
const currentPage = computed(() => articleStore.pagination.page)

onMounted(() => {
  articleStore.fetchArticles()
})

const doSearch = debounce((val) => {
  articleStore.setSearchFilter(val)
  articleStore.fetchArticles()
}, 400)

watch(categoryId, (val) => {
  articleStore.setCategoryFilter(val)
  articleStore.fetchArticles()
})

watch(keyword, (val) => {
  doSearch(val)
})

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const prevPage = () => {
  articleStore.prevPage()
  scrollToTop()
}

const nextPage = () => {
  articleStore.nextPage()
  scrollToTop()
}

const clearFilters = () => {
  keyword.value = ''
  categoryId.value = null
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- Header Section -->
      <div class="mb-8 sm:mb-12">
        <div class="flex flex-col gap-6">
          <!-- Title & Description -->
          <div class="text-center sm:text-left">
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
              Discover Articles
            </h1>
            <p class="text-sm sm:text-base text-gray-600">
              Explore our latest stories, insights, and expert perspectives
            </p>
          </div>

          <!-- Search & Filter Bar -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <!-- Search Input -->
              <div class="flex-1 relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  v-model="keyword"
                  type="text"
                  placeholder="Search articles by title or content..."
                  class="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400"
                />
                <button
                  v-if="keyword"
                  @click="keyword = ''"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- Category Filter -->
              <div class="sm:w-64">
                <CategorySelect v-model="categoryId" />
              </div>

              <!-- Clear Filters Button -->
              <button
                v-if="hasFilters"
                @click="clearFilters"
                class="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span class="hidden sm:inline">Clear</span>
              </button>
            </div>

            <!-- Active Filters Indicator -->
            <div v-if="hasFilters" class="mt-4 flex flex-wrap items-center gap-2">
              <span class="text-xs font-medium text-gray-600">Active filters:</span>

              <span
                v-if="keyword"
                class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                "{{ keyword }}"
                <button @click="keyword = ''" class="ml-1 hover:text-blue-900">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>

              <span
                v-if="categoryId"
                class="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Category filter
                <button @click="categoryId = null" class="ml-1 hover:text-purple-900">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Info Bar -->
      <div v-if="!articleStore.loading.list" class="mb-6 flex items-center justify-between px-1">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span class="font-medium">
            {{ totalResults }}
            {{ totalResults === 1 ? 'article' : 'articles' }}
            {{ hasFilters ? 'found' : 'available' }}
          </span>
        </div>

        <div class="text-sm text-gray-500">Page {{ currentPage }}</div>
      </div>

      <!-- Loading State -->
      <div
        v-if="articleStore.loading.list"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200"
        >
          <div class="h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
          <div class="p-6 space-y-3">
            <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div class="space-y-2 pt-2">
              <div class="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
              <div class="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
              <div class="h-3 bg-gray-200 rounded animate-pulse w-4/5"></div>
            </div>
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
            class="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          />
        </div>

        <!-- Pagination Controls -->
        <div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <!-- Previous Button -->
          <button
            @click="prevPage"
            :disabled="currentPage <= 1"
            class="group inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm border border-gray-200 hover:border-gray-300"
          >
            <svg
              class="w-5 h-5 transition-transform group-hover:-translate-x-1 group-disabled:transform-none"
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
            <span class="hidden sm:inline">Previous</span>
            <span class="sm:hidden">Prev</span>
          </button>

          <!-- Page Indicator -->
          <div
            class="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200"
          >
            <svg
              class="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-blue-900">Page</span>
              <span class="text-lg font-bold text-blue-600">{{ currentPage }}</span>
            </div>
          </div>

          <!-- Next Button -->
          <button
            @click="nextPage"
            :disabled="isLastPage"
            class="group inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm border border-gray-200 hover:border-gray-300"
          >
            <span class="hidden sm:inline">Next</span>
            <span class="sm:hidden">Next</span>
            <svg
              class="w-5 h-5 transition-transform group-hover:translate-x-1 group-disabled:transform-none"
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

        <!-- Pagination Info -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            Showing {{ totalResults }} {{ totalResults === 1 ? 'result' : 'results' }} on page
            {{ currentPage }}
          </p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-16 sm:py-24">
        <div
          class="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-inner"
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

        <h3 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          {{ hasFilters ? 'No articles found' : 'No articles available' }}
        </h3>

        <p class="text-gray-600 text-center max-w-md mb-6">
          {{
            hasFilters
              ? "We couldn't find any articles matching your search criteria. Try adjusting your filters."
              : 'There are no articles available at the moment. Check back later for new content.'
          }}
        </p>

        <!-- Clear Filters Button (in empty state) -->
        <button
          v-if="hasFilters"
          @click="clearFilters"
          class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Clear all filters
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add smooth transitions for all interactive elements */
button {
  transition: all 0.2s ease-in-out;
}

/* Ensure ArticleCard hover animations work smoothly */
.transform {
  transition-property: transform, box-shadow;
}
</style>
