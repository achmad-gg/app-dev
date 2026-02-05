<script setup>
import { useMyArticleStore } from '@/stores/myArticle.store'
import ArticleItem from './ArticleItem.vue'

const store = useMyArticleStore()
</script>

<template>
  <div class="bg-white rounded-xl border divide-y">
    <ArticleItem
      v-for="article in store.articles"
      :key="article.id"
      :article="article"
    />
  </div>
</template>
