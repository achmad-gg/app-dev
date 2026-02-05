<template>
  <div
    class="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer p-4 flex flex-col gap-2"
    @click="goDetail"
  >
    <h3 class="text-lg font-semibold text-gray-800">{{ article.title }}</h3>
    <p class="text-gray-600 text-sm line-clamp-3">{{ article.content || article.excerpt }}</p>
    <div class="flex justify-between items-center text-xs text-gray-500 mt-2">
      <span>{{ article.category_name || article.category }}</span>
      <span>{{ article.fullname || article.author }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  article: Object,
})

const router = useRouter()
const goDetail = () => {
  router.push(`/articles/${props.article.id}`)
}
</script>

<style>
/* Optional: untuk truncate teks 3 baris */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
</style>
