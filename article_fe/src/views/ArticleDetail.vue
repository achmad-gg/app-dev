<script setup>
import { onUnmounted, computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '../stores/article.store'
import { useAuthStore } from '../stores/auth.store'
import { useCommentStore } from '@/stores/comment.store'

import LikeButton from '../components/LikeButton.vue'
import CommentList from '../components/CommentList.vue'

const API_BASE_URL = 'http://localhost:3000'

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

const coverImageUrl = computed(() => {
  const img = article.value?.cover_image
  if (!img) return null
  if (img.startsWith('http')) return img
  if (img.startsWith('/uploads')) return `${API_BASE_URL}/api${img}`
  return img
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const readingTime = computed(() => {
  if (!article.value?.content) return ''
  const div = document.createElement('div')
  div.innerHTML = article.value.content
  const text = div.textContent || div.innerText || ''
  const words = text.trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
})

watch(
  () => route.params.id,
  async (id) => {
    if (!id) return
    hasError.value = false
    try {
      const a = await articleStore.fetchArticleDetail(id, { isPublic: true })
      if (a?.id) {
        await commentStore.fetchComments(a.id)
      } else {
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
  <div class="min-h-screen bg-gray-50/50">
    <!-- Skeleton Loader -->
    <div v-if="isLoading">
      <div class="animate-pulse">
        <!-- Cover skeleton -->
        <div class="w-full h-56 sm:h-72 lg:h-80 bg-gray-200"></div>
        <!-- Content skeleton -->
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded w-24"></div>
            <div class="h-9 bg-gray-200 rounded w-full"></div>
            <div class="h-9 bg-gray-200 rounded w-4/5"></div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-200"></div>
            <div class="space-y-1.5">
              <div class="h-3.5 bg-gray-200 rounded w-28"></div>
              <div class="h-3 bg-gray-200 rounded w-36"></div>
            </div>
          </div>
          <div class="pt-4 space-y-3">
            <div class="h-4 bg-gray-100 rounded w-full"></div>
            <div class="h-4 bg-gray-100 rounded w-full"></div>
            <div class="h-4 bg-gray-100 rounded w-5/6"></div>
            <div class="h-4 bg-gray-100 rounded w-full"></div>
            <div class="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Article Content -->
    <article v-else-if="!isLoading && article && !hasError">
      <!-- Cover Image -->
      <div class="relative w-full h-56 sm:h-72 lg:h-[420px] bg-gray-100 overflow-hidden">
        <img
          v-if="coverImageUrl"
          :src="coverImageUrl"
          :alt="article.title"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="w-full h-full bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center"
        >
          <svg class="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <!-- Gradient overlay at bottom -->
        <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <!-- Content Container -->
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Article Header -->
        <div class="pt-8 sm:pt-10 pb-8 border-b border-gray-100">
          <!-- Category -->
          <span
            class="inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase text-blue-700 bg-blue-50 rounded-full mb-4"
          >
            {{ article.category_name || article.category }}
          </span>

          <!-- Title -->
          <h1 class="font-heading text-2xl sm:text-3xl lg:text-[2.5rem] font-bold text-gray-900 leading-tight tracking-tight mb-6">
            {{ article.title }}
          </h1>

          <!-- Author & Meta -->
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <span class="text-sm font-bold text-white uppercase">
                {{ (article.fullname || article.author || 'A').charAt(0) }}
              </span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">
                {{ article.fullname || article.author }}
              </p>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <time v-if="article.created_at">{{ formatDate(article.created_at) }}</time>
                <span v-if="readingTime" class="text-gray-300">·</span>
                <span v-if="readingTime">{{ readingTime }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Article Body -->
        <div class="prose-custom py-8 sm:py-10">
          <div v-html="article.content"></div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-100"></div>

        <!-- Actions-->
        <div class="py-8 space-y-6">
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
          <p v-if="!canInteract && interactDisabledReason" class="text-sm text-gray-500 leading-relaxed">
            {{ interactDisabledReason }}
          </p>
        </div>

        <!-- Comments Section -->
        <div class="border-t border-gray-100 pt-8 pb-16">
          <h2 class="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            Comments
          </h2>

          <div :class="!canInteract ? 'opacity-60 pointer-events-none' : ''">
            <CommentList :articleId="article.id" :readonly="!canInteract" />
            <p v-if="!canInteract && interactDisabledReason" class="text-sm text-gray-500 mt-4">
              {{ interactDisabledReason }}
            </p>
          </div>
        </div>
      </div>
    </article>

    <!-- Error State -->
    <div
      v-else-if="!isLoading && (hasError || !article)"
      class="flex flex-col items-center justify-center py-24 sm:py-32 px-4"
    >
      <div class="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
        <svg class="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 class="font-heading text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Article not found</h3>
      <p class="text-gray-500 text-center max-w-sm text-sm leading-relaxed mb-6">
        The article you're looking for doesn't exist or has been removed.
      </p>
      <button
        @click="router.push('/')"
        class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Articles
      </button>
    </div>

    <!-- Login Modal -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showLoginModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        @click.self="showLoginModal = false"
      >
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div v-if="showLoginModal" class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-bold text-gray-900">Login Required</h3>
                <p class="mt-1 text-sm text-gray-500 leading-relaxed">
                  Untuk melakukan like dan komentar, kamu perlu login terlebih dahulu.
                </p>
              </div>
            </div>

            <div class="mt-6 flex items-center justify-end gap-3">
              <button
                class="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                @click="showLoginModal = false"
              >
                Nanti
              </button>
              <router-link
                to="/auth/login"
                class="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                @click="showLoginModal = false"
              >
                Login Sekarang
              </router-link>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@reference "../main.css";

/* === PROSE STYLES FOR ARTICLE BODY === */
.prose-custom {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: #374151;
}

.prose-custom :deep(p) {
  margin-bottom: 1.5em;
}

.prose-custom :deep(h1) {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-top: 2em;
  margin-bottom: 0.75em;
  line-height: 1.3;
}

.prose-custom :deep(h2) {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-top: 1.75em;
  margin-bottom: 0.5em;
  line-height: 1.35;
}

.prose-custom :deep(h3) {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.4;
}

.prose-custom :deep(strong) {
  color: #111827;
  font-weight: 600;
}

.prose-custom :deep(em) {
  font-style: italic;
}

.prose-custom :deep(a) {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose-custom :deep(a:hover) {
  color: #1d4ed8;
}

.prose-custom :deep(blockquote) {
  border-left: 3px solid #d1d5db;
  padding-left: 1.25em;
  margin: 1.5em 0;
  color: #6b7280;
  font-style: italic;
}

.prose-custom :deep(ul),
.prose-custom :deep(ol) {
  padding-left: 1.5em;
  margin-bottom: 1.5em;
}

.prose-custom :deep(li) {
  margin-bottom: 0.5em;
}

.prose-custom :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 1.5em 0;
}

.prose-custom :deep(code) {
  background: #f3f4f6;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}

.prose-custom :deep(pre) {
  background: #1f2937;
  color: #e5e7eb;
  padding: 1.25em;
  border-radius: 12px;
  overflow-x: auto;
  margin: 1.5em 0;
}

.prose-custom :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.prose-custom :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2em 0;
}
</style>
