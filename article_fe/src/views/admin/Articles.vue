// admin/Articles.vue
<script setup>
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.store'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchPendingArticles()
})

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Header Section -->
      <header class="space-y-1">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
              Article Moderation
            </h1>
            <p class="text-sm text-gray-600 mt-1">
              Review and approve submitted articles
            </p>
          </div>
          
          <!-- Pending Count Badge -->
          <div v-if="adminStore.pendingArticles.length > 0" class="flex items-center gap-3">
            <div class="px-4 py-2 bg-orange-100 rounded-xl border border-orange-200">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-semibold text-orange-700">
                  {{ adminStore.pendingArticles.length }} Pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Empty State -->
      <div
        v-if="adminStore.pendingArticles.length === 0"
        class="bg-white rounded-2xl border border-gray-200 p-12"
      >
        <div class="text-center max-w-md mx-auto">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p class="text-gray-600 mb-6">
            No pending articles to review at the moment. Great work! 🎉
          </p>
          <div class="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>All articles reviewed</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Articles List -->
      <div v-else class="space-y-4">
        <div
          v-for="a in adminStore.pendingArticles"
          :key="a.id"
          class="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-md transition-all duration-300 group"
        >
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            
            <!-- Article Info -->
            <div class="flex-1 space-y-3">
              <!-- Title & Status -->
              <div class="flex items-start gap-3">
                <div class="flex-1">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {{ a.title }}
                  </h3>
                  
                  <!-- Meta Information -->
                  <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <!-- Author -->
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span class="font-medium">{{ a.author_email }}</span>
                    </div>

                    <!-- Submission Date (if available) -->
                    <div class="flex items-center gap-1.5 text-gray-500">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-xs">Pending review</span>
                    </div>
                  </div>
                </div>

                <!-- Status Badge -->
                <div class="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                  <span class="text-xs font-semibold text-orange-700">Pending</span>
                </div>
              </div>

              <!-- Article Preview/Excerpt (if available) -->
              <div v-if="a.excerpt || a.content" class="pt-3 border-t border-gray-100">
                <p class="text-sm text-gray-600 line-clamp-2">
                  {{ a.excerpt || a.content?.substring(0, 150) + '...' }}
                </p>
              </div>

              <!-- Article Stats (if available) -->
              <div class="flex items-center gap-4 text-xs text-gray-500 pt-2">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Preview available</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex lg:flex-col gap-3 lg:min-w-[160px]">
              <!-- Approve Button -->
              <button
                @click="adminStore.approveArticle(a.id)"
                class="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Approve</span>
              </button>

              <!-- Reject Button -->
              <button
                @click="adminStore.rejectArticle(a.id, 'Content quality insufficient')"
                class="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-red-300 text-red-700 font-semibold rounded-xl hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Reject</span>
              </button>

              <!-- View Details Button (Optional) -->
              <button
                class="hidden lg:flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span class="text-sm">View</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div v-if="adminStore.pendingArticles.length > 0" class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-blue-900 mb-1">Review Guidelines</p>
            <p class="text-xs text-blue-700">
              Please ensure articles follow community guidelines before approving. Check for appropriate content, proper formatting, and quality standards.
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>