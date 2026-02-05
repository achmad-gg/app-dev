<template>
  <div class="group bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
    <div class="flex items-start gap-3">
      <!-- Avatar -->
      <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span class="text-white font-semibold text-sm">{{ getInitials(comment.name) }}</span>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-semibold text-gray-900 text-sm">{{ comment.name }}</span>
          <span class="text-gray-400 text-xs" v-if="comment.created_at">• {{ formatTimeAgo(comment.created_at) }}</span>
        </div>

        <p class="text-gray-700 text-sm leading-relaxed mb-2">{{ comment.content }}</p>

        <!-- Reply button -->
        <button
          class="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          @click="openReply"
        >
          Reply
        </button>

        <!-- Reply form -->
        <div v-if="showReply" class="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <textarea
            v-model="replyContent"
            rows="3"
            placeholder="Write a reply..."
            class="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div class="mt-2 flex items-center justify-between">
            <span class="text-xs text-gray-500">{{ replyContent.length }}/500</span>
            <div class="flex gap-2">
              <button
                @click="cancelReply"
                class="px-3 py-1.5 text-gray-700 text-xs font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                @click="submitReply"
                :disabled="loading || replyContent.length < 3 || replyContent.length > 500"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reply
              </button>
            </div>
          </div>
        </div>

        <!-- Children (recursive) -->
        <div v-if="comment.children?.length" class="mt-4 space-y-3 pl-4 border-l-2 border-blue-100">
          <CommentItem
            v-for="r in comment.children"
            :key="r.id"
            :comment="r"
            :article-id="articleId"
            :loading="loading"
            @reply="$emit('reply', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  comment: { type: Object, required: true },
  articleId: { type: [String, Number], required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['reply'])

const showReply = ref(false)
const replyContent = ref('')

const openReply = () => {
  showReply.value = true
  replyContent.value = ''
}
const cancelReply = () => {
  showReply.value = false
  replyContent.value = ''
}
const submitReply = () => {
  if (replyContent.value.length < 3) return
  emit('reply', { parentId: props.comment.id, content: replyContent.value })
  cancelReply()
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.substring(0, 2).toUpperCase()
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
