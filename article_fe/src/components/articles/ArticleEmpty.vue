<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const status = computed(() => route.query.status)

const title = computed(() => {
  if (status.value === 'draft') return 'No draft articles'
  if (status.value === 'published') return 'No published articles'
  if (status.value === 'archived') return 'No archived articles'
  return 'You have not written any articles yet'
})

const description = computed(() => {
  if (status.value)
    return 'Try changing the filter or start writing a new article.'
  return 'Start writing to share your ideas with the community.'
})

const showWriteButton = computed(() => status.value !== 'archived')

const goToWrite = () => {
  router.push('/write')
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-gray-300 rounded-xl bg-gray-50"
  >
    <!-- Icon -->
    <div
      class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4"
    >
      <svg
        class="w-7 h-7 text-blue-600"
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

    <!-- Text -->
    <h3 class="text-lg font-semibold text-gray-900">
      {{ title }}
    </h3>
    <p class="text-sm text-gray-600 mt-1 max-w-sm">
      {{ description }}
    </p>

    <!-- Action -->
    <button
      v-if="showWriteButton"
      @click="goToWrite"
      class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
      Write your first article
    </button>
  </div>
</template>
