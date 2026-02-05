<script setup>
import { watch } from 'vue'
import { useLikeStore } from '../stores/like.store'

const props = defineProps({
  articleId: {
    type: [Number, String],
    required: true,
  },
})

const likeStore = useLikeStore()

const handleToggle = async () => {
  await likeStore.toggle(props.articleId)
}

// Format number
const formatCount = (n) => {
  if (!Number.isFinite(n)) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// Fetch ulang jika article berubah
watch(
  () => props.articleId,
  (id) => {
    if (id) likeStore.fetchInitial(id)
  },
  { immediate: true }
)
</script>

<template>
  <button
    @click="handleToggle"
    :disabled="likeStore.fetching || likeStore.toggling"
    class="group inline-flex items-center gap-3 px-6 py-3 bg-white border-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      likeStore.liked
        ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
        : 'border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50',
    ]"
  >
    <!-- Heart Icon -->
    <div class="relative w-6 h-6">
      <svg
        class="absolute inset-0 w-6 h-6 transition-all duration-300"
        :class="
          likeStore.liked
            ? 'fill-red-500 scale-110'
            : 'fill-none stroke-current group-hover:fill-red-100'
        "
        viewBox="0 0 24 24"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>

      <!-- Spinner -->
      <svg
        v-if="likeStore.toggling"
        class="absolute inset-0 w-6 h-6 animate-spin text-red-500"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>

    <!-- Count -->
    <div class="flex flex-col items-start">
      <span class="text-lg font-bold leading-none">
        {{ formatCount(likeStore.count) }}
      </span>
      <span class="text-xs opacity-75 leading-none mt-0.5">
        {{ likeStore.count === 1 ? 'Like' : 'Likes' }}
      </span>
    </div>
  </button>
</template>
