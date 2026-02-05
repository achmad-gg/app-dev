<script setup>
import { useMyArticleStore } from '@/stores/myArticle.store'
const store = useMyArticleStore()
</script>

<template>
  <div class="flex justify-between items-center">
    <button
      :disabled="store.page === 1"
      @click="store.prevPage"
    >
      Prev
    </button>

    <span class="text-sm">
      Page {{ store.page }} of {{ store.totalPages }}
    </span>

    <button
      :disabled="store.page === store.totalPages"
      @click="store.nextPage"
    >
      Next
    </button>
  </div>
</template>
