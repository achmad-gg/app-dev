<template>
  <section class="space-y-6">
    <!-- Root Comment Form -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <textarea
        v-model="content"
        rows="4"
        placeholder="Share your thoughts..."
        class="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 border-0 focus:outline-none focus:ring-0 resize-none"
      />

      <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <span class="text-xs text-gray-500"> {{ content.length }}/500 characters </span>
        <button
          @click="submit"
          :disabled="commentStore.loading || content.length < 3 || content.length > 500"
          class="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          <span>{{ commentStore.loading ? 'Posting...' : 'Post Comment' }}</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="commentStore.loading && commentStore.comments.length === 0" class="space-y-4">
      <div v-for="n in 3" :key="n" class="animate-pulse">
        <div class="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200">
          <div class="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-3 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="commentTree.length === 0" class="text-center py-12">
      <p class="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
    </div>

    <!-- Tree -->
    <div v-else class="space-y-4">
      <CommentItem
        v-for="c in commentTree"
        :key="c.id"
        :comment="c"
        :article-id="props.articleId"
        :loading="commentStore.loading"
        @reply="handleReply"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCommentStore } from '../stores/comment.store'
import CommentItem from './CommentItem.vue'

const commentStore = useCommentStore()

const props = defineProps({
  articleId: { type: [String, Number], required: true },
})

const content = ref('')

const submit = async () => {
  if (content.value.length < 3) return
  await commentStore.addComment(props.articleId, content.value, null)
  content.value = ''
}

// build tree from flat list
const commentTree = computed(() => {
  const map = new Map()
  const roots = []

  commentStore.comments.forEach((c) => {
    map.set(c.id, { ...c, children: [] })
  })

  map.forEach((c) => {
    if (c.parent_id) {
      const parent = map.get(c.parent_id)
      if (parent) parent.children.push(c)
      else roots.push(c)
    } else {
      roots.push(c)
    }
  })

  return roots
})

// child emits { parentId, content }
const handleReply = async ({ parentId, content }) => {
  await commentStore.addComment(props.articleId, content, parentId)
}

onMounted(() => {
  commentStore.fetchComments(props.articleId)
})
</script>
