<!-- admin/ArticleDetail.vue -->
<script setup>
import { onUnmounted, computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '../../stores/article.store'
import { useAuthStore } from '../../stores/auth.store'
import { useCommentStore } from '@/stores/comment.store'

import LikeButton from '../../components/LikeButton.vue'
import CommentList from '../../components/CommentList.vue'

const API_BASE_URL = 'http://localhost:3000'

const coverImageUrl = computed(() => {
  const img = article.value?.cover_image
  if (!img) return null

  if (img.startsWith('http')) return img

  if (img.startsWith('/uploads')) {
    return `${API_BASE_URL}/api${img}`
  }

  return img
})

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const commentStore = useCommentStore()

const article = computed(() => articleStore.articleDetail)
const isLoading = computed(() => articleStore.loading.detail)
const hasError = ref(false)

const articleStatus = computed(() => (article.value?.status || '').toLowerCase())

const showLoginModal = ref(false)

const handleLikeGuarded = () => {
  showLoginModal.value = true
}

const goBackToAdminArticles = () => {
  router.push('/admin/articles')
}

const canInteract = computed(() => {
  return isAuthenticated.value && articleStatus.value === 'approved'
})

const interactDisabledReason = computed(() => {
  if (!article.value) return ''
  if (!isAuthenticated.value) return 'Login dulu untuk like & comment.'
  if (articleStatus.value !== 'approved')
    return 'Like & comment hanya untuk artikel yang sudah approved.'
  return ''
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Get status badge classes
const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

watch(
  () => route.params.id,
  async (id) => {
    if (!id) return

    hasError.value = false

    try {
      const a = await articleStore.fetchArticleDetail(id)
      if (a?.id) {
        await commentStore.fetchComments(a.id)
      } else {
        // Article not found
        hasError.value = true
      }
    } catch (error) {
      console.error('Failed to load article:', error)
      hasError.value = true
    }
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
      <div v-if="isLoading" class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="animate-pulse">
          <!-- Admin Header Skeleton -->
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <div class="h-5 bg-gray-200 rounded w-24"></div>
            <div class="h-8 bg-gray-200 rounded-full w-20"></div>
          </div>

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
          </div>
        </div>
      </div>

      <!-- Article Content -->
      <article
        v-else-if="!isLoading && article && !hasError"
        class="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <!-- Admin Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <span class="text-xs text-purple-600 uppercase tracking-wide font-semibold">
                  Admin Review Mode
                </span>
                <p class="text-xs text-gray-600 mt-0.5">
                  You are viewing this article as an administrator
                </p>
              </div>
            </div>

            <button
              @click="goBackToAdminArticles"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to List
            </button>
          </div>
        </div>

        <!-- Cover Image -->
        <div class="h-64 sm:h-80 bg-gray-100 overflow-hidden">
          <img
            v-if="coverImageUrl"
            :src="coverImageUrl"
            alt="Article cover"
            class="w-full h-full object-cover"
            loading="lazy"
          />

          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
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
        </div>

        <div class="p-6 sm:p-8 lg:p-12">
          <!-- Meta Information -->
          <div class="flex flex-wrap items-center gap-3 text-sm mb-6">
            <!-- Category Badge -->
            <span
              class="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded-full border border-blue-200"
            >
              {{ article.category_name || article.category || 'Uncategorized' }}
            </span>

            <span class="text-gray-300">•</span>

            <!-- Author -->
            <div class="flex items-center gap-2 text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{{ article.fullname || article.author || 'Unknown Author' }}</span>
            </div>

            <!-- Date -->
            <template v-if="article.created_at">
              <span class="text-gray-300">•</span>
              <div class="flex items-center gap-2 text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{{ formatDate(article.created_at) }}</span>
              </div>
            </template>

            <!-- Status Badge -->
            <span
              class="ml-auto inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border"
              :class="getStatusBadgeClass(article.status)"
            >
              <span
                class="w-2 h-2 rounded-full mr-2"
                :class="{
                  'bg-green-600': article.status === 'approved',
                  'bg-yellow-600': article.status === 'pending',
                  'bg-red-600': article.status === 'rejected',
                }"
              ></span>
              {{ article.status?.toUpperCase() || 'UNKNOWN' }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-2xl sm:text-4xl lg:text-4xl font-bold text-gray-900 leading-tight mb-8">
            {{ article.title }}
          </h1>


          <!-- Content -->
          <div class="prose prose-lg prose-gray max-w-none mb-12">
            <div class="text-gray-700 leading-relaxed whitespace-pre-line text-base sm:text-lg" v-html="article.content">
            </div>
          </div>

          <div class="border-t border-gray-200"></div>

          <!-- Actions -->
          <div class="pt-8 space-y-8">
            <!-- Like Button -->
            <div class="flex items-center gap-4">
              <LikeButton
                :article-id="article.id"
                :status="article.status"
                :can-interact="canInteract"
                :is-authenticated="isAuthenticated"
                @login-required="handleLikeGuarded"
              />
            </div>

            <!-- Interaction Warning -->
            <p
              v-if="!canInteract && interactDisabledReason"
              class="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200"
            >
              ℹ️ {{ interactDisabledReason }}
            </p>

            <!-- Comments Section -->
            <div class="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg
                  class="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Comments
                <span
                  class="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full"
                >
                  {{ article.comments_count || 0 }}
                </span>
              </h2>

              <!-- Comments List -->
              <div :class="!canInteract ? 'opacity-60 pointer-events-none' : ''">
                <CommentList :articleId="article.id" :readonly="!canInteract" />
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- Error State - Article Not Found -->
      <div
        v-else-if="!isLoading && (hasError || !article)"
        class="flex flex-col items-center justify-center py-16 sm:py-24"
      >
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
        <button
          @click="goBackToAdminArticles"
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
          Back to Admin Articles
        </button>
      </div>

      <!-- Login Modal -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="showLoginModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          @click.self="showLoginModal = false"
        >
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div class="flex items-start gap-4 mb-4">
              <div
                class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <svg
                  class="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900">Login Required</h3>
                <p class="mt-1 text-sm text-gray-600">
                  Untuk melakukan like dan komentar, kamu perlu login terlebih dahulu.
                </p>
              </div>
            </div>

            <div class="mt-6 flex items-center justify-end gap-3">
              <button
                class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                @click="showLoginModal = false"
              >
                Nanti
              </button>

              <router-link
                to="/auth/login"
                class="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
                @click="showLoginModal = false"
              >
                Login Sekarang
              </router-link>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
@reference "../../main.css";

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
