<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const API_BASE_URL = 'http://localhost:3000'

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
})

const router = useRouter()

const excerptText = computed(() => {
  if (props.article?.excerpt) return props.article.excerpt
  if (!props.article?.content) return '-'

  const div = document.createElement('div')
  div.innerHTML = props.article.content
  const text = div.textContent || div.innerText || ''

  return text.length > 120 ? text.slice(0, 120) + '…' : text
})

const coverImageUrl = computed(() => {
  const img = props.article?.cover_image
  if (!img) return null
  if (img.startsWith('http')) return img
  if (img.startsWith('/uploads')) return `${API_BASE_URL}/api${img}`
  return img
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const goDetail = () => {
  const id = props.article?.id
  if (!id) return
  router.push(`/articles/${id}`)
}
</script>

<template>
  <article
    class="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300 cursor-pointer flex flex-col hover:shadow-lg hover:shadow-gray-200/50"
    @click="goDetail"
  >
    <!-- Cover Image -->
    <div class="relative aspect-[16/10] overflow-hidden bg-gray-50">
      <img
        v-if="coverImageUrl"
        :src="coverImageUrl"
        :alt="article?.title || 'Article cover'"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center"
      >
        <svg class="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      <!-- Category Badge -->
      <div class="absolute top-3 left-3">
        <span
          class="inline-block px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg shadow-sm"
        >
          {{ article?.category_name || article?.category || 'Uncategorized' }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col flex-1 p-5">
      <!-- Title -->
      <h3
        class="font-heading text-lg sm:text-xl font-semibold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors duration-200"
      >
        {{ article?.title || '-' }}
      </h3>

      <!-- Excerpt -->
      <p class="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">
        {{ excerptText }}
      </p>

      <!-- Meta -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-50">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <span class="text-[10px] font-bold text-white uppercase">
              {{ (article?.fullname || article?.author || 'A').charAt(0) }}
            </span>
          </div>
          <span class="text-xs font-medium text-gray-700 truncate max-w-[120px]">
            {{ article?.fullname || article?.author || '-' }}
          </span>
        </div>
        <time v-if="article?.created_at" class="text-xs text-gray-400 tabular-nums">
          {{ formatDate(article.created_at) }}
        </time>
      </div>
    </div>
  </article>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
