<script setup>
import { useRouter } from 'vue-router'
import { useMyArticleStore } from '@/stores/myArticle.store'

const props = defineProps({ article: Object })
const router = useRouter()
const store = useMyArticleStore()

const onDelete = () => {
  if (confirm('Delete this article?')) {
    store.deleteArticle(props.article.id)
  }
}
</script>

<template>
  <div class="relative">
    <button class="text-gray-500 hover:text-gray-700">⋮</button>

    <!-- dropdown pseudo -->
    <div class="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow">
      <button @click="router.push(`/write/${article.id}`)">Edit</button>
      <button @click="onDelete" class="text-red-600">Delete</button>
    </div>
  </div>
</template>
