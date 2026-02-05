<script setup>
import { useMyArticleStore } from '@/stores/myArticle.store'

const store = useMyArticleStore()
</script>

<template>
  <div class="flex gap-3 flex-col sm:flex-row">
    <input
      v-model="store.filters.keyword"
      @input="store.fetchMyArticles"
      placeholder="Search title..."
      class="flex-1 px-4 py-2 border rounded-lg"
    />

    <select
      v-model="store.filters.status"
      @change="store.fetchMyArticles"
      class="px-4 py-2 border rounded-lg"
    >
      <option value="">All Status</option>
      <option value="draft">Draft</option>
      <option value="pending">Pending</option>
      <option value="published">Published</option>
      <option value="rejected">Rejected</option>
    </select>
  </div>
</template>
