<template>
  <div
    class="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer p-4 flex flex-col gap-2"
    @click="goDetail"
  >
    <h3 class="text-lg font-semibold text-gray-800">
      {{ article?.title || '-' }}
    </h3>

    <p class="text-gray-600 text-sm line-clamp-3">
      {{ article?.excerpt || article?.content || '-' }}
    </p>

    <div class="flex justify-between items-center text-xs text-gray-500 mt-2">
      <span>
        {{ article?.category_name || article?.category || '-' }}
      </span>
      <span>
        {{ article?.fullname || article?.author || article?.email || '-' }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
})

const router = useRouter()

const goDetail = () => {
  const id = props.article?.id
  if (!id) return
  router.push(`/articles/${id}`)
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
</style>
