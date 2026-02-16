<template>
  <div
    class="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden flex flex-col"
    @click="goDetail"
  >
    <!-- Cover -->
    <div class="h-40 bg-gray-100 overflow-hidden">
      <img
        v-if="coverImageUrl"
        :src="coverImageUrl"
        alt="Article cover"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
      >
        <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 flex flex-col gap-2">
      <h3 class="text-lg font-semibold text-gray-800 line-clamp-2">
        {{ article?.title || '-' }}
      </h3>

      <p class="text-gray-600 text-sm line-clamp-3">
        {{ article?.excerpt || article?.content || '-' }}
      </p>

      <div class="flex justify-between items-center text-xs text-gray-500 mt-2">
        <span>
          {{ article?.category_name || article?.category || '-' }}
        </span>
        <span>
          {{ article?.fullname || article?.author || article?.email || '-' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const API_BASE_URL = 'http://localhost:3000'

const coverImageUrl = computed(() => {
  const img = props.article?.cover_image
  if (!img) return null

  // jika sudah full url, pakai langsung
  if (img.startsWith('http')) return img

  // kasus kamu: "/uploads/..."
  if (img.startsWith('/uploads')) {
    return `${API_BASE_URL}/api${img}`
  }

  return img
})

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
})

const router = useRouter()

const goDetail = () => {
  const id = props.article?.id
  if (!id) return
  router.push(`/articles/${id}`)
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
</style>
