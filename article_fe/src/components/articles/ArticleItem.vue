<script setup>
import { useRouter } from 'vue-router'
import ArticleActions from './ArticleActions.vue'

defineProps({
  article: Object,
})

const router = useRouter()
</script>

<template>
  <div class="flex justify-between p-4 hover:bg-gray-50">
    <div class="min-w-0">
      <h3
        class="font-semibold truncate cursor-pointer hover:text-blue-600"
        @click="router.push(`/articles/${article.id}`)"
      >
        {{ article.title }}
      </h3>
      <p class="text-sm text-gray-500">
        {{ article.category_name }} ·
        {{ new Date(article.created_at).toLocaleDateString() }}
      </p>
    </div>

    <div class="flex items-center gap-3">
      <span
        class="px-3 py-1 text-xs font-semibold rounded-full capitalize"
        :class="article.status"
      >
        {{ article.status }}
      </span>

      <ArticleActions :article="article" />
    </div>
  </div>
</template>
