<template>
  <section class="space-y-6">
    <!-- Comment Form - Moved to Top -->
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
          <svg
            v-if="commentStore.loading"
            class="animate-spin w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{{ commentStore.loading ? 'Posting...' : 'Post Comment' }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
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

    <!-- Empty State -->
    <div v-else-if="commentStore.comments.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <p class="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
    </div>

    <!-- Comments List -->
    <div v-else class="space-y-4">
      <div
        v-for="c in commentStore.comments"
        :key="c.id"
        class="group bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
      >
        <div class="flex items-start gap-3">
          <!-- Avatar -->
          <div
            class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <span class="text-white font-semibold text-sm">
              {{ getInitials(c.user_email) }}
            </span>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-gray-900 text-sm">
                {{ c.user_email }}
              </span>
              <span class="text-gray-400 text-xs" v-if="c.created_at">
                • {{ formatTimeAgo(c.created_at) }}
              </span>
            </div>
            <p class="text-gray-700 text-sm leading-relaxed">
              {{ c.content }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCommentStore } from '../stores/comment.store'

const commentStore = useCommentStore()

const props = defineProps({
  articleId: {
    type: [String, Number],
    required: true
  }
});

const content = ref('');

const submit = async () => {
  if (content.value.length < 3) return;
  
  await commentStore.submit(props.articleId, content.value);
  content.value = '';
};

// Helper: Get initials from email
const getInitials = (email) => {
  if (!email) return '?';
  const name = email.split('@')[0];
  return name.substring(0, 2).toUpperCase();
};

// Helper: Format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

onMounted(() => {
  commentStore.fetchComments(props.articleId)
})
</script>