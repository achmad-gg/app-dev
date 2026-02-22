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
const totalArticles = computed(() => articleStore.pagination.total || 0)
const hasFilters = computed(() => keyword.value || categoryId.value)
const isLastPage = computed(() => {
  const { page, limit, total } = articleStore.pagination
  return page * limit >= total
})
const currentPage = computed(() => articleStore.pagination.page)
const totalPages = computed(() => {
  const { limit, total } = articleStore.pagination
  return Math.ceil(total / limit) || 1
})

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
  <div class="min-h-screen bg-gray-50/50">
    <!-- Hero Section -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div class="max-w-2xl">
          <h1 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Discover Stories
          </h1>
          <p class="mt-3 sm:mt-4 text-base sm:text-lg text-gray-500 leading-relaxed">
            Explore the latest insights, perspectives, and expert stories from our community of writers.
          </p>
        </div>

        <!-- Search & Filter -->
        <div class="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3">
          <!-- Search Input -->
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-4.5 w-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="keyword"
              type="text"
              placeholder="Search articles..."
              class="w-full pl-11 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
            <button
              v-if="keyword"
              @click="keyword = ''"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Category Filter -->
          <div class="sm:w-56">
            <CategorySelect v-model="categoryId" />
          </div>

          <!-- Clear Button -->
          <button
            v-if="hasFilters"
            @click="clearFilters"
            class="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        </div>

        <!-- Active Filters -->
        <div v-if="hasFilters" class="mt-4 flex flex-wrap items-center gap-2">
          <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Filters:</span>
          <span
            v-if="keyword"
            class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
          >
            "{{ keyword }}"
            <button @click="keyword = ''" class="hover:text-blue-900 transition-colors">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
          <span
            v-if="categoryId"
            class="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full"
          >
            Category
            <button @click="categoryId = null" class="hover:text-violet-900 transition-colors">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <!-- Results Info -->
      <div v-if="!articleStore.loading.list" class="mb-6 flex items-center justify-between">
        <p class="text-sm text-gray-500">
          <span class="font-semibold text-gray-800">{{ totalArticles }}</span>
          {{ totalArticles === 1 ? 'article' : 'articles' }}
          {{ hasFilters ? 'found' : '' }}
        </p>
        <p class="text-sm text-gray-400 tabular-nums">
          Page {{ currentPage }} of {{ totalPages }}
        </p>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="articleStore.loading.list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="n in 6"
          :key="n"
          class="bg-white rounded-2xl overflow-hidden border border-gray-100"
        >
          <div class="aspect-[16/10] bg-gray-100 animate-pulse"></div>
          <div class="p-5 space-y-3">
            <div class="h-5 bg-gray-100 rounded-lg animate-pulse w-4/5"></div>
            <div class="h-4 bg-gray-100 rounded-lg animate-pulse w-3/5"></div>
            <div class="space-y-2 pt-1">
              <div class="h-3 bg-gray-50 rounded animate-pulse w-full"></div>
              <div class="h-3 bg-gray-50 rounded animate-pulse w-4/5"></div>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-gray-50">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-gray-100 animate-pulse"></div>
                <div class="h-3 bg-gray-100 rounded animate-pulse w-16"></div>
              </div>
              <div class="h-3 bg-gray-100 rounded animate-pulse w-20"></div>
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
          />
        </div>

        <!-- Pagination -->
        <div class="mt-12 flex items-center justify-center gap-3">
          <button
            @click="prevPage"
            :disabled="currentPage <= 1"
            class="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          <div class="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl tabular-nums">
            {{ currentPage }} / {{ totalPages }}
          </div>

          <button
            @click="nextPage"
            :disabled="isLastPage"
            class="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            Next
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-20 sm:py-28">
        <div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
          <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <h3 class="font-heading text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          {{ hasFilters ? 'No articles found' : 'No articles yet' }}
        </h3>

        <p class="text-gray-500 text-center max-w-sm text-sm leading-relaxed mb-6">
          {{
            hasFilters
              ? "We couldn't find any articles matching your criteria. Try adjusting your filters."
              : 'There are no articles available at the moment. Check back later.'
          }}
        </p>

        <button
          v-if="hasFilters"
          @click="clearFilters"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          Clear all filters
        </button>
      </div>
    </div>
  </div>
</template>
