<!-- ArticleActions.vue -->
<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useMyArticleStore } from '@/stores/myArticle.store'

const props = defineProps({ 
  article: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const store = useMyArticleStore()
const isOpen = ref(false)

const toggleDropdown = (event) => {
  event.stopPropagation()
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const onEdit = (event) => {
  event.stopPropagation()
  router.push(`/write/${props.article.id}`)
  closeDropdown()
}

const onView = (event) => {
  event.stopPropagation()
  router.push(`/articles/${props.article.id}`)
  closeDropdown()
}

const onDelete = async (event) => {
  event.stopPropagation()
  if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
    try {
      await store.deleteArticle(props.article.id)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }
  closeDropdown()
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (isOpen.value && !event.target.closest('.dropdown-container')) {
    closeDropdown()
  }
}

// Setup event listener
if (typeof window !== 'undefined') {
  window.addEventListener('click', handleClickOutside)
}

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleClickOutside)
  }
})
</script>

<template>
  <div class="relative dropdown-container">
    <button
      @click="toggleDropdown"
      type="button"
      class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      :class="{ 'bg-gray-100 text-gray-600': isOpen }"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
      >
        <div class="py-1">
          <button
            @click="onView"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View</span>
          </button>

          <button
            @click="onEdit"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>

          <div class="border-t border-gray-100 my-1"></div>

          <button
            @click="onDelete"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Ensure dropdown appears above other elements */
.dropdown-container {
  z-index: 10;
}
</style>