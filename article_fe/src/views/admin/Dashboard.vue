<script setup>
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useRouter } from 'vue-router';

const adminStore = useAdminStore()
const router = useRouter()

const adminArticles = () => {
  router.push('/admin/articles')
}

onMounted(() => {
  adminStore.fetchDashboard()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header Section -->
      <header class="space-y-1">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p class="text-sm text-gray-600 mt-1">Global system overview and statistics</p>
          </div>

          <!-- Last Updated Badge -->
          <div
            class="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm"
          >
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-xs font-medium text-gray-600">Live</span>
          </div>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="!adminStore.stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          v-for="i in 5"
          :key="i"
          class="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse"
        >
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <section v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Users Card -->
        <div
          class="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div class="px-2 py-1 bg-blue-50 rounded-lg">
              <span class="text-xs font-semibold text-blue-600">+12%</span>
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Total Users</p>
            <h3 class="text-3xl font-bold text-gray-900">
              {{ adminStore.stats.users.toLocaleString() }}
            </h3>
          </div>
        </div>

        <!-- Articles Card -->
        <div
          class="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div class="px-2 py-1 bg-purple-50 rounded-lg">
              <span class="text-xs font-semibold text-purple-600">+8%</span>
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Total Articles</p>
            <h3 class="text-3xl font-bold text-gray-900">
              {{ adminStore.stats.articles.toLocaleString() }}
            </h3>
          </div>
        </div>

        <!-- Comments Card -->
        <div
          class="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <div class="px-2 py-1 bg-green-50 rounded-lg">
              <span class="text-xs font-semibold text-green-600">+15%</span>
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Total Comments</p>
            <h3 class="text-3xl font-bold text-gray-900">
              {{ adminStore.stats.comments.toLocaleString() }}
            </h3>
          </div>
        </div>

        <!-- Likes Card -->
        <div
          class="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-pink-50 rounded-xl group-hover:bg-pink-100 transition-colors">
              <svg
                class="w-6 h-6 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div class="px-2 py-1 bg-pink-50 rounded-lg">
              <span class="text-xs font-semibold text-pink-600">+20%</span>
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Total Likes</p>
            <h3 class="text-3xl font-bold text-gray-900">
              {{ adminStore.stats.likes.toLocaleString() }}
            </h3>
          </div>
        </div>

        <!-- Pending Articles Card (Highlighted) -->
        <div
          class="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-start justify-between mb-4">
            <div
              class="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-colors"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
              <span class="text-xs font-bold text-white">Action Needed</span>
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-orange-100 mb-1">Pending Articles</p>
            <h3 class="text-3xl font-bold text-white">
              {{ adminStore.stats.pending_articles }}
            </h3>
          </div>
          <div class="mt-4 pt-4 border-t border-white/20">
            <button
              @click="adminArticles"
              class="text-xs font-semibold text-white hover:text-orange-100 transition-colors cursor-pointer flex items-center gap-1 group/btn"
            >
              Review Now
              <svg
                class="w-3 h-3 group-hover/btn:translate-x-1 transition-transform"
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
            </button>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section v-if="adminStore.stats" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- User Management -->
        <div
          class="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 group cursor-pointer"
        >
          <div class="flex items-center gap-4">
            <div class="p-4 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 mb-1">User Management</h4>
              <p class="text-sm text-gray-600">Manage users and permissions</p>
            </div>
            <svg
              class="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all"
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

        <!-- Content Moderation -->
        <div
          class="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 group cursor-pointer"
        >
          <div class="flex items-center gap-4">
            <div class="p-4 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 mb-1">Content Moderation</h4>
              <p class="text-sm text-gray-600">Review and approve content</p>
            </div>
            <svg
              class="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all"
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

        <!-- System Settings -->
        <div
          class="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 group cursor-pointer"
        >
          <div class="flex items-center gap-4">
            <div class="p-4 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
              <svg
                class="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 mb-1">System Settings</h4>
              <p class="text-sm text-gray-600">Configure system preferences</p>
            </div>
            <svg
              class="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all"
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
      </section>

      <!-- Recent Activity -->
      <section
        v-if="adminStore.stats"
        class="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div class="px-6 py-5 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p class="text-sm text-gray-600 mt-1">Latest system events and updates</p>
        </div>
        <div class="p-6">
          <div class="flex items-center justify-center py-12">
            <div class="text-center">
              <div
                class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p class="text-sm font-medium text-gray-900">No recent activity</p>
              <p class="text-xs text-gray-500 mt-1">Activity logs will appear here</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
