<!-- components/NotificationDropdown.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification.store'
import { useRouter } from 'vue-router'

const notificationStore = useNotificationStore()
const router = useRouter()

const isOpen = ref(false)
const dropdownRef = ref(null)

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

// Handle notification click
const openNotification = async (n) => {
  if (!n.is_read) {
    await notificationStore.markAsRead(n.id)
  }

  // Close dropdown
  isOpen.value = false

  // Navigate based on notification type
  if (n.type === 'comment_deleted' && n.meta?.article_id) {
    router.push(`/articles/${n.meta.article_id}`)
  } else if (n.type === 'article_approved' && n.meta?.article_id) {
    router.push(`/articles/${n.meta.article_id}`)
  } else if (n.type === 'article_rejected' && n.meta?.article_id) {
    router.push(`/my-articles`)
  } else if (n.type === 'new_comment' && n.meta?.article_id) {
    router.push(`/articles/${n.meta.article_id}`)
  }
}

// Mark all as read
const markAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

// Clear all notifications
const clearAll = async () => {
  if (confirm('Are you sure you want to clear all notifications?')) {
    await notificationStore.clearAll()
  }
}

// Format relative time
const formatRelativeTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Get notification icon based on type
const getNotificationIcon = (type) => {
  switch (type) {
    case 'article_approved':
      return 'check-circle'
    case 'article_rejected':
      return 'x-circle'
    case 'comment_deleted':
      return 'trash'
    case 'new_comment':
      return 'chat'
    default:
      return 'bell'
  }
}

// Get notification color based on type
const getNotificationColor = (type) => {
  switch (type) {
    case 'article_approved':
      return 'text-green-600 bg-green-50'
    case 'article_rejected':
      return 'text-red-600 bg-red-50'
    case 'comment_deleted':
      return 'text-orange-600 bg-orange-50'
    case 'new_comment':
      return 'text-blue-600 bg-blue-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Load notifications on mount
  notificationStore.fetchMyNotifications()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <!-- Notification Bell Button -->
    <button
      @click="toggleDropdown"
      class="relative flex items-center justify-center p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
      :class="{ 'bg-gray-100 text-gray-900': isOpen }"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <!-- Unread Badge -->
      <span
        v-if="notificationStore.unreadCount > 0"
        class="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full px-1"
      >
        {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
      >
        <!-- Header -->
        <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <h3 class="font-bold text-gray-900">Notifications</h3>
              <span
                v-if="notificationStore.unreadCount > 0"
                class="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full"
              >
                {{ notificationStore.unreadCount }}
              </span>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center gap-1">
              <button
                v-if="notificationStore.unreadCount > 0"
                @click="markAllAsRead"
                class="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-200 rounded transition-colors"
                title="Mark all as read"
              >
                Mark all read
              </button>
            </div>
          </div>
        </div>

        <!-- Notification List -->
        <div class="max-h-[400px] overflow-y-auto">
          <!-- Empty State -->
          <div
            v-if="notificationStore.notifications.length === 0"
            class="flex flex-col items-center justify-center py-12 px-4"
          >
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-900 mb-1">No notifications yet</p>
            <p class="text-xs text-gray-500 text-center">
              When you get notifications, they'll show up here
            </p>
          </div>

          <!-- Notification Items -->
          <ul v-else class="divide-y divide-gray-100">
            <li
              v-for="n in notificationStore.notifications"
              :key="n.id"
              @click="openNotification(n)"
              class="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              :class="!n.is_read ? 'bg-blue-50/50' : ''"
            >
              <div class="flex items-start gap-3">
                <!-- Icon -->
                <div
                  class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  :class="getNotificationColor(n.type)"
                >
                  <!-- Check Circle Icon -->
                  <svg
                    v-if="getNotificationIcon(n.type) === 'check-circle'"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                  <!-- X Circle Icon -->
                  <svg
                    v-else-if="getNotificationIcon(n.type) === 'x-circle'"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                  <!-- Trash Icon -->
                  <svg
                    v-else-if="getNotificationIcon(n.type) === 'trash'"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>

                  <!-- Chat Icon -->
                  <svg
                    v-else-if="getNotificationIcon(n.type) === 'chat'"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>

                  <!-- Bell Icon (default) -->
                  <svg
                    v-else
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900 font-medium mb-1 leading-snug">
                    {{ n.message }}
                  </p>
                  <div class="flex items-center gap-2">
                    <p class="text-xs text-gray-500">
                      {{ formatRelativeTime(n.created_at) }}
                    </p>
                    <span v-if="!n.is_read" class="w-2 h-2 bg-blue-600 rounded-full"></span>
                  </div>
                </div>

                <!-- Chevron -->
                <div class="flex-shrink-0">
                  <svg
                    class="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Footer -->
        <div
          v-if="notificationStore.notifications.length > 0"
          class="px-4 py-3 bg-gray-50 border-t border-gray-200"
        >
          <button
            @click="clearAll"
            class="w-full text-sm font-medium text-gray-600 hover:text-gray-900 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear all notifications
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Custom scrollbar for notification list */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>