// CommentItem.vue
<template>
  <div
    class="group bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
  >
    <div class="flex items-start gap-3">
      <!-- Avatar -->
      <div
        class="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border border-gray-200 bg-white"
      >
        <img
          v-if="comment.avatar && !avatarBroken"
          :src="avatarUrl(comment.avatar)"
          :alt="comment.name || 'Avatar'"
          class="w-full h-full object-cover"
          @error="onAvatarError"
        />

        <div
          v-else
          class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
        >
          <span class="text-white font-semibold text-sm">{{ getInitials(comment.name) }}</span>
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-semibold text-gray-900 text-sm">
            {{ comment.name || 'Anonymous' }}
          </span>

          <!-- Admin badge -->
          <span
            v-if="comment.user_role === 'admin'"
            class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200"
          >
            ADMIN
          </span>
          <span class="text-gray-400 text-xs" v-if="comment.created_at"
            >• {{ formatTimeAgo(comment.created_at) }}</span
          >
        </div>

        <p class="text-gray-700 text-sm leading-relaxed mb-2">{{ comment.content }}</p>

        <div class="flex items-center gap-3">
          <!-- Reply -->
          <button
            class="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
            :class="
              props.readonly
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-700'
            "
            :disabled="props.readonly"
            @click="openReply"
          >
            Reply
          </button>

          <!-- Delete -->
          <button
            v-if="canDelete"
            @click="deleteComment"
            class="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        </div>

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
            :readonly="props.readonly"
            @reply="$emit('reply', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCommentStore } from '../stores/comment.store'
import { useAuthStore } from '@/stores/auth.store'

const API_BASE = import.meta.env.VITE_API_BASE_URL
const UPLOADS_PREFIX = '/uploads/'
const commentStore = useCommentStore()
const auth = useAuthStore()

const props = defineProps({
  comment: { type: Object, required: true },
  articleId: { type: [String, Number], required: true },
  loading: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
})

const emit = defineEmits(['reply'])

const showReply = ref(false)
const replyContent = ref('')

const openReply = () => {
  if (props.readonly) return
  showReply.value = true
  replyContent.value = ''
}

const cancelReply = () => {
  showReply.value = false
  replyContent.value = ''
}
const submitReply = () => {
  const content = replyContent.value.trim()

  if (content.length < 3 || content.length > 500) {
    alert('Comment cannot be empty or only spaces')
    return
  }

  emit('reply', {
    parentId: props.comment.id,
    content,
  })

  cancelReply()
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.substring(0, 2).toUpperCase()
}

const avatarUrl = (avatar) => {
  if (!avatar) return ''
  // kalau backend sudah kirim full URL, langsung pakai
  if (/^https?:\/\//i.test(avatar)) return avatar

  // normalisasi (hapus leading slash biar aman)
  const clean = avatar.replace(/^\/+/, '')
  return `${API_BASE}${UPLOADS_PREFIX}${clean}`
}

const avatarBroken = ref(false)

const onAvatarError = () => {
  avatarBroken.value = true
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

const canDelete = computed(() => {
  if (!auth.initialized) return false
  if (!auth.user) return false
  
  return (
    auth.user.role === 'admin' ||
    String(auth.user.id) === String(props.comment.user_id)
  )
})

const deleteComment = async () => {
  if (!confirm('Delete this comment and all replies?')) return
  await commentStore.deleteComment(props.comment.id, props.articleId)
}
</script>
