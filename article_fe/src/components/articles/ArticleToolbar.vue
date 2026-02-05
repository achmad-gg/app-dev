<!-- ArticleToolbar.vue -->
<script setup>
import { ref, watch } from 'vue'
import { useMyArticleStore } from '@/stores/myArticle.store'
import { useRouter } from 'vue-router'

const store = useMyArticleStore()
const router = useRouter()

const searchQuery = ref('')
const selectedStatus = ref(store.filters.status || '')

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
]

// Watch for status changes
watch(selectedStatus, (newStatus) => {
  store.setStatus(newStatus || null)
})

const createNewArticle = () => {
  router.push('/write')
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
    <div class="flex flex-col lg:flex-row gap-4">
      
      <!-- Search Bar (optional - jika API support search) -->
      <!-- <div class="flex-1">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search articles by title..."
            class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div> -->

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 lg:ml-auto">
        <!-- Status Filter -->
        <div class="relative min-w-[160px]">
          <select
            v-model="selectedStatus"
            class="appearance-none w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- New Article Button -->
        <button
          @click="createNewArticle"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">New Article</span>
          <span class="sm:hidden">New</span>
        </button>
      </div>
    </div>
  </div>
</template>