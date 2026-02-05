<script setup>
import { onMounted } from 'vue'
import { useMyArticleStore } from '@/stores/myArticle.store'

import ArticleToolbar from '@/components/articles/ArticleToolbar.vue'
import ArticleList from '@/components/articles/ArticleList.vue'
import ArticlePagination from '@/components/articles/ArtilcePagination.vue'
import ArticleEmpty from '@/components/articles/ArticleEmpty.vue'

const store = useMyArticleStore()

onMounted(() => {
  store.fetchMyArticles()
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-gray-900">My Articles</h1>
      <p class="text-sm text-gray-600">
        Manage your drafts and published content
      </p>
    </header>

    <ArticleToolbar />

    <ArticleEmpty
      v-if="!store.loading && store.articles.length === 0"
    />

    <ArticleList
      v-else
    />

    <ArticlePagination />
  </div>
</template>
