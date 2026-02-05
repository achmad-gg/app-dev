<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/article.store'
import { useCategoryStore } from '@/stores/category.store'

const router = useRouter()
const articleStore = useArticleStore()
const categoryStore = useCategoryStore()

const form = ref({
  title: '',
  content: '',
  category_id: null,
})

const error = ref(null)
const submitting = ref(false)
const wordCount = ref(0)
const charCount = ref(0)
const showDraftHistory = ref(false)
const draftHistory = ref([])
const saveSuccess = ref(false)

onMounted(() => {
  categoryStore.fetchCategories()
  loadDraftHistory()
})

// Update word and character count
const updateCounts = () => {
  const content = form.value.content.trim()
  charCount.value = content.length
  wordCount.value = content ? content.split(/\s+/).length : 0
}

// Watch for content changes
const onContentChange = () => {
  updateCounts()
}

// Load draft history from localStorage
const loadDraftHistory = () => {
  const history = localStorage.getItem('article_draft_history')
  if (history) {
    draftHistory.value = JSON.parse(history)
  }
}

// Save draft to history
const saveDraft = () => {
  if (!form.value.title && !form.value.content) {
    error.value = 'Cannot save empty draft'
    return
  }

  const draft = {
    id: Date.now(),
    title: form.value.title || 'Untitled Draft',
    content: form.value.content,
    category_id: form.value.category_id,
    timestamp: new Date().toISOString(),
    wordCount: wordCount.value,
    charCount: charCount.value,
  }

  // Get existing history
  const history = localStorage.getItem('article_draft_history')
  let drafts = history ? JSON.parse(history) : []
  
  // Add new draft to beginning of array
  drafts.unshift(draft)
  
  // Keep only last 10 drafts
  if (drafts.length > 10) {
    drafts = drafts.slice(0, 10)
  }
  
  // Save to localStorage
  localStorage.setItem('article_draft_history', JSON.stringify(drafts))
  draftHistory.value = drafts
  
  // Show success feedback
  saveSuccess.value = true
  setTimeout(() => {
    saveSuccess.value = false
  }, 2000)
}

// Load a specific draft
const loadDraft = (draft) => {
  form.value = {
    title: draft.title === 'Untitled Draft' ? '' : draft.title,
    content: draft.content,
    category_id: draft.category_id,
  }
  updateCounts()
  showDraftHistory.value = false
}

// Delete a draft from history
const deleteDraft = (draftId) => {
  if (!confirm('Are you sure you want to delete this draft?')) return
  
  const filtered = draftHistory.value.filter(d => d.id !== draftId)
  localStorage.setItem('article_draft_history', JSON.stringify(filtered))
  draftHistory.value = filtered
}

// Clear all drafts
const clearAllDrafts = () => {
  if (!confirm('Are you sure you want to delete all drafts?')) return
  
  localStorage.removeItem('article_draft_history')
  draftHistory.value = []
  showDraftHistory.value = false
}

// Format timestamp
const formatDate = (timestamp) => {
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
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const submit = async () => {
  if (submitting.value) return
  error.value = null

  // frontend validation (UX only)
  if (!form.value.category_id) {
    error.value = 'Category wajib dipilih'
    return
  }

  if (form.value.title.trim().length < 5) {
    error.value = 'Title minimal 5 karakter'
    return
  }

  if (form.value.content.trim().length < 20) {
    error.value = 'Content terlalu pendek'
    return
  }

  submitting.value = true
  try {
    await articleStore.createArticle(form.value)
    // Clear current draft after successful submission
    form.value = { title: '', content: '', category_id: null }
    router.push('/')
  } catch (err) {
    const status = err.response?.status
    const data = err.response?.data

    if (status === 401) {
      error.value = 'Sesi kamu habis. Silakan login ulang.'
    } else if (status === 403) {
      error.value = 'Kamu tidak punya akses untuk membuat artikel.'
    } else if (status === 400 || status === 422) {
      error.value = data?.errors?.[0]?.message || data?.message || 'Data tidak valid'
    } else {
      error.value = 'Terjadi kesalahan pada server. Coba lagi nanti.'
    }
  } finally {
    submitting.value = false
  }
}

// Auto-save draft every 30 seconds
let autoSaveInterval = null
onMounted(() => {
  autoSaveInterval = setInterval(() => {
    if (form.value.title || form.value.content) {
      saveDraft()
    }
  }, 30000) // 30 seconds
})

// Clear interval on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <button
            @click="router.back()"
            class="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Write New Article</h1>
            <p class="text-sm text-gray-600 mt-1">Share your thoughts and stories with the community</p>
          </div>
        </div>

        <!-- Info Alert -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-blue-900 mb-1">Article Review Process</p>
            <p class="text-xs text-blue-700">
              Your article will be in <span class="font-semibold">pending</span> status until reviewed and approved by our admin team.
            </p>
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-red-800">{{ error }}</p>
        </div>
        <button @click="error = null" class="text-red-400 hover:text-red-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Save Success Alert -->
      <div v-if="saveSuccess" class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-green-800">Draft saved successfully!</p>
        </div>
      </div>

      <!-- Two Column Form -->
      <form @submit.prevent="submit">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          <!-- Left Column - Title & Category -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Title Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:sticky lg:top-6">
              <div class="space-y-6">
                <div>
                  <label for="title" class="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Article Title
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    v-model="form.title"
                    type="text"
                    required
                    class="w-full text-xl font-semibold border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400"
                    placeholder="Enter your article title..."
                  />
                  <p class="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ form.title.length }} characters (minimum 5)
                  </p>
                </div>

                <!-- Category Selection -->
                <div>
                  <label for="category" class="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Category
                    <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <select
                      id="category"
                      v-model.number="form.category_id"
                      :disabled="categoryStore.loading"
                      required
                      class="w-full appearance-none bg-white border-2 border-gray-300 rounded-xl px-4 py-3 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option :value="null">
                        {{ categoryStore.loading ? 'Loading categories...' : '-- Select a category --' }}
                      </option>
                      <option v-for="c in categoryStore.categories" :key="c.id" :value="c.id">
                        {{ c.name }}
                      </option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Draft History -->
                <div class="border-t border-gray-200 pt-4">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Draft History
                    </h3>
                    <button
                      v-if="draftHistory.length > 0"
                      @click="showDraftHistory = !showDraftHistory"
                      class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {{ showDraftHistory ? 'Hide' : 'Show' }} ({{ draftHistory.length }})
                    </button>
                  </div>

                  <!-- No Drafts State -->
                  <div v-if="draftHistory.length === 0" class="text-center py-4">
                    <svg class="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-xs text-gray-500">No saved drafts yet</p>
                  </div>

                  <!-- Draft List -->
                  <div v-else-if="showDraftHistory" class="space-y-2 max-h-64 overflow-y-auto">
                    <div
                      v-for="draft in draftHistory"
                      :key="draft.id"
                      class="group p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
                    >
                      <div class="flex items-start justify-between gap-2" @click="loadDraft(draft)">
                        <div class="flex-1 min-w-0">
                          <h4 class="text-xs font-semibold text-gray-900 truncate mb-1">
                            {{ draft.title }}
                          </h4>
                          <div class="flex items-center gap-2 text-xs text-gray-500">
                            <span class="flex items-center gap-1">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {{ formatDate(draft.timestamp) }}
                            </span>
                            <span>•</span>
                            <span>{{ draft.wordCount }} words</span>
                          </div>
                        </div>
                        <button
                          @click.stop="deleteDraft(draft.id)"
                          class="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                          title="Delete draft"
                        >
                          <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Clear All Button -->
                    <button
                      @click="clearAllDrafts"
                      class="w-full text-xs text-red-600 hover:text-red-700 font-medium py-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Clear All Drafts
                    </button>
                  </div>
                </div>

                <!-- Divider -->
                <div class="border-t border-gray-200 pt-4">
                  <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Writing Tips
                  </h3>
                  <ul class="space-y-2 text-xs text-gray-600">
                    <li class="flex items-start gap-2">
                      <svg class="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Choose a clear and engaging title</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <svg class="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Select the most appropriate category</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <svg class="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Write with clarity and structure</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <svg class="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Proofread before submitting</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column - Content & Actions -->
          <div class="lg:col-span-3 space-y-6">
            
            <!-- Content Editor Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="p-6">
                <label for="content" class="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Article Content
                  <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  v-model="form.content"
                  @input="onContentChange"
                  rows="16"
                  required
                  class="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-y min-h-[400px]"
                  placeholder="Write your article content here... Be creative and express your thoughts!"
                />
                
                <!-- Content Stats -->
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <div class="flex items-center gap-4 text-xs text-gray-600">
                    <span class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span class="font-semibold">{{ wordCount }}</span> words
                    </span>
                    <span class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="font-semibold">{{ charCount }}</span> characters
                    </span>
                  </div>
                  <span 
                    :class="charCount >= 20 ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'"
                    class="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <svg v-if="charCount >= 20" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ charCount >= 20 ? 'Minimum reached' : 'Min 20 characters' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex flex-col sm:flex-row gap-3">
                <button
                  id="save-draft-btn"
                  type="button"
                  @click="saveDraft"
                  class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                >
                  <svg v-if="!saveSuccess" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <svg v-else class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{{ saveSuccess ? 'Saved!' : 'Save Draft' }}</span>
                </button>

                <button
                  type="submit"
                  :disabled="submitting"
                  class="flex-1 sm:flex-[2] inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg v-if="submitting" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>{{ submitting ? 'Publishing...' : 'Publish Article' }}</span>
                </button>
              </div>

              <!-- Guidelines Footer -->
              <div class="text-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                By publishing, you agree to our 
                <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">Community Guidelines</a>
                and
                <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>
              </div>
            </div>

          </div>

        </div>
      </form>

    </div>
  </div>
</template>