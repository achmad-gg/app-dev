<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCategoryStore } from '@/stores/category.store'

const categoryStore = useCategoryStore()

const name = ref('')
const editingId = ref(null)
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')

onMounted(() => {
  categoryStore.fetchCategories()
})

const resetForm = () => {
  name.value = ''
  editingId.value = null
  error.value = null
}

const submit = async () => {
  error.value = null

  if (!name.value.trim()) {
    error.value = 'Category name is required'
    return
  }

  if (name.value.trim().length < 3) {
    error.value = 'Category name must be at least 3 characters'
    return
  }

  loading.value = true
  try {
    if (editingId.value) {
      await categoryStore.updateCategory(editingId.value, name.value.trim())
    } else {
      await categoryStore.createCategory(name.value.trim())
    }
    resetForm()
  } catch (err) {
    error.value = err?.response?.data?.message || err?.message || 'Action failed'
  } finally {
    loading.value = false
  }
}

const edit = (category) => {
  name.value = category.name
  editingId.value = category.id
  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const remove = async (id) => {
  if (!confirm('Are you sure you want to delete this category? This action cannot be undone.'))
    return

  try {
    await categoryStore.deleteCategory(id)
  } catch (err) {
    alert(err?.response?.data?.message || 'Failed to delete category')
  }
}

// Filter categories based on search
const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    return categoryStore.categories
  }

  return categoryStore.categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Category Management</h1>
        <p class="text-sm text-gray-600 mt-2">
          Create and manage article categories for better organization
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Left Column - Form -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:sticky lg:top-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center"
                :class="
                  editingId
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-blue-100 text-blue-600'
                "
              >
                <svg
                  v-if="!editingId"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-gray-900">
                  {{ editingId ? 'Edit Category' : 'Create New Category' }}
                </h2>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ editingId ? 'Update category information' : 'Add a new category to the system' }}
                </p>
              </div>
            </div>

            <!-- Edit Mode Alert -->
            <div
              v-if="editingId"
              class="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2"
            >
              <svg
                class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div class="flex-1">
                <p class="text-xs font-medium text-amber-900">Editing Mode</p>
                <p class="text-xs text-amber-700 mt-0.5">You are currently editing a category</p>
              </div>
            </div>

            <!-- Error Alert -->
            <div
              v-if="error"
              class="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2"
            >
              <svg
                class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div class="flex-1">
                <p class="text-xs font-medium text-red-900">Error</p>
                <p class="text-xs text-red-700 mt-0.5">{{ error }}</p>
              </div>
              <button @click="error = null" class="text-red-400 hover:text-red-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- Form -->
            <div class="space-y-4">
              <div>
                <label for="categoryName" class="block text-sm font-semibold text-gray-900 mb-2">
                  Category Name
                  <span class="text-red-500">*</span>
                </label>
                <input
                  id="categoryName"
                  v-model="name"
                  type="text"
                  placeholder="e.g. Technology, Sports, Business..."
                  class="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400"
                  @keydown.enter="submit"
                />
                <p class="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ name.length }} characters (minimum 3)
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-2">
                <button
                  @click="submit"
                  :disabled="loading || !name.trim()"
                  class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="
                    editingId
                      ? 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-2 focus:ring-amber-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                  "
                >
                  <svg
                    v-if="loading"
                    class="w-5 h-5 animate-spin"
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
                  <svg
                    v-else-if="!editingId"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{{ loading ? 'Processing...' : editingId ? 'Update Category' : 'Create Category' }}</span>
                </button>

                <button
                  v-if="editingId"
                  @click="resetForm"
                  class="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                  title="Cancel editing"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Help Text -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Guidelines
              </h3>
              <ul class="space-y-2 text-xs text-gray-600">
                <li class="flex items-start gap-2">
                  <svg
                    class="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Use clear and descriptive names</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg
                    class="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Keep category names concise</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg
                    class="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Avoid duplicate categories</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Right Column - List -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <!-- List Header -->
            <div class="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    All Categories
                  </h2>
                  <p class="text-xs text-gray-500 mt-0.5">
                    {{ filteredCategories.length }} {{ filteredCategories.length === 1 ? 'category' : 'categories' }}
                    {{ searchQuery ? 'found' : 'total' }}
                  </p>
                </div>
              </div>

              <!-- Search Bar -->
              <div class="relative">
                <svg
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search categories..."
                  class="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="categoryStore.loading" class="p-8 text-center">
              <svg
                class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3"
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
              <p class="text-sm text-gray-600">Loading categories...</p>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="filteredCategories.length === 0"
              class="p-12 text-center"
            >
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">
                {{ searchQuery ? 'No categories found' : 'No categories yet' }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ searchQuery ? 'Try a different search term' : 'Create your first category to get started' }}
              </p>
            </div>

            <!-- Category List -->
            <ul v-else class="divide-y divide-gray-100">
              <li
                v-for="(c, index) in filteredCategories"
                :key="c.id"
                class="px-6 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <!-- Index Number -->
                    <div
                      class="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    >
                      {{ index + 1 }}
                    </div>

                    <!-- Category Name -->
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-gray-900 truncate">{{ c.name }}</h3>
                      <p class="text-xs text-gray-500 mt-0.5">ID: {{ c.id }}</p>
                    </div>

                    <!-- Edit Badge (when editing) -->
                    <span
                      v-if="editingId === c.id"
                      class="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full"
                    >
                      Editing
                    </span>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      @click="edit(c)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                      title="Edit category"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>

                    <button
                      @click="remove(c.id)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                      title="Delete category"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional custom styles if needed */
</style>