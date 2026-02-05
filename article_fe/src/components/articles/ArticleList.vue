<!-- ArticleList.vue -->
<script setup>
import { useMyArticleStore } from '@/stores/myArticle.store'
import ArticleItem from './ArticleItem.vue'

const store = useMyArticleStore()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible">
    <div class="divide-y divide-gray-100">
      <ArticleItem
        v-for="article in store.articles"
        :key="article.id"
        :article="article"
      />
    </div>
  </div>
</template>