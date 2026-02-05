<script setup>
import { onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleStore } from '../stores/article.store'
import { useAuthStore } from '../stores/auth.store'
import { useCommentStore } from '@/stores/comment.store'

import LikeButton from '../components/LikeButton.vue'
import CommentList from '../components/CommentList.vue'

const route = useRoute()
const articleStore = useArticleStore()
const auth = useAuthStore()
const commentStore = useCommentStore()

const article = computed(() => articleStore.articleDetail)

// normalize status biar aman (kadang backend kirim "Approved", "APPROVED", dll)
const articleStatus = computed(() => (article.value?.status || '').toLowerCase())

// ✅ boleh interaksi hanya jika login + approved
const canInteract = computed(() => {
  return auth.isAuthenticated && articleStatus.value === 'approved'
})

const interactDisabledReason = computed(() => {
  if (!article.value) return ''
  if (!auth.isAuthenticated) return 'Login dulu untuk like & comment.'
  if (articleStatus.value !== 'approved')
    return 'Like & comment hanya untuk artikel yang sudah approved.'
  return ''
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ✅ cukup watch route id saja (hindari fetch double dari onMounted + watch)
watch(
  () => route.params.id,
  async (id) => {
    const a = await articleStore.fetchArticleDetail(id)
    if (a?.id) await commentStore.fetchComments(a.id)
  },
  { immediate: true },
)

onUnmounted(() => {
  articleStore.clearDetail()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- Skeleton Loader -->
      <div
        v-if="articleStore.loading.detail"
        class="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div class="animate-pulse">
          <div class="h-64 sm:h-80 bg-gradient-to-br from-gray-200 to-gray-300"></div>
          <div class="p-6 sm:p-8 lg:p-12 space-y-6">
            <div class="flex items-center gap-3">
              <div class="h-6 bg-gray-200 rounded-full w-24"></div>
              <div class="h-4 w-4 bg-gray-200 rounded-full"></div>
              <div class="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div class="space-y-3">
              <div class="h-8 bg-gray-200 rounded w-full"></div>
              <div class="h-8 bg-gray-200 rounded w-4/5"></div>
            </div>
            <div class="space-y-3 pt-6">
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-4 bg-gray-200 rounded w-5/6"></div>
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-4 bg-gray-200 rounded w-4/5"></div>
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div class="border-t border-gray-200 pt-6 mt-8 space-y-4">
              <div class="h-12 bg-gray-200 rounded-xl w-32"></div>
              <div class="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Article Content -->
      <article
        v-else-if="articleStore.articleDetail"
        class="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div
          class="h-64 sm:h-80 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
        >
          <svg
            class="w-20 h-20 text-blue-200"
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

        <div class="p-6 sm:p-8 lg:p-12">
          <!-- Meta -->
          <div class="flex flex-wrap items-center gap-3 text-sm mb-6">
            <span
              class="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded-full"
            >
              {{ articleStore.articleDetail.category_name || articleStore.articleDetail.category }}
            </span>

            <span class="text-gray-300">•</span>

            <div class="flex items-center gap-2 text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{{
                articleStore.articleDetail.fullname || articleStore.articleDetail.author
              }}</span>
            </div>

            <span class="text-gray-300" v-if="articleStore.articleDetail.created_at">•</span>
            <div
              class="flex items-center gap-2 text-gray-600"
              v-if="articleStore.articleDetail.created_at"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{{ formatDate(articleStore.articleDetail.created_at) }}</span>
            </div>

            <!-- ✅ Status badge -->
            <span
              class="ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
              :class="
                articleStore.articleDetail.status === 'approved'
                  ? 'bg-green-50 text-green-700'
                  : articleStore.articleDetail.status === 'pending'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-red-50 text-red-700'
              "
            >
              {{ articleStore.articleDetail.status }}
            </span>
          </div>

          <h1 class="text-2xl sm:text-4xl lg:text-4xl font-bold text-gray-900 leading-tight mb-8">
            {{ articleStore.articleDetail.title }}
          </h1>

          <div class="prose prose-lg prose-gray max-w-none mb-12">
            <div class="text-gray-700 leading-relaxed whitespace-pre-line text-base sm:text-lg">
              {{ articleStore.articleDetail.content }}
            </div>
          </div>

          <div class="border-t border-gray-200"></div>

          <!-- Actions -->
          <div class="pt-8 space-y-8">
            <div class="flex items-center gap-4">
              <LikeButton
                :article-id="articleStore.articleDetail.id"
                :status="articleStore.articleDetail.status"
                :show-reason="false"
              />
            </div>

            <p v-if="!canInteract && interactDisabledReason" class="text-sm text-gray-500">
              {{ interactDisabledReason }}
            </p>

            <!-- Comments -->
            <div class="bg-gray-50 rounded-2xl p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Comments
              </h2>

              <!-- ✅ disable wrapper ketika tidak boleh interaksi -->
              <div :class="!canInteract ? 'opacity-60 pointer-events-none' : ''">
                <CommentList v-if="canInteract" :articleId="articleStore.articleDetail.id" />
                <p v-else class="text-sm text-gray-500">
                  {{ interactDisabledReason }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- Error -->
      <div v-else class="flex flex-col items-center justify-center py-16 sm:py-24">
        <div
          class="w-24 h-24 sm:w-32 sm:h-32 bg-red-100 rounded-full flex items-center justify-center mb-6"
        >
          <svg
            class="w-12 h-12 sm:w-16 sm:h-16 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Article not found</h3>
        <p class="text-gray-600 text-center max-w-md mb-6">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <router-link
          to="/"
          class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Articles
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "../main.css";
.prose {
  @apply text-gray-700;
}
.prose p {
  @apply mb-4;
}
.prose strong {
  @apply text-gray-900 font-semibold;
}
.prose em {
  @apply italic;
}
</style>
