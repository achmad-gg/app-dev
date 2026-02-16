// admin/Articles.vue
<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useRouter } from 'vue-router'

const adminStore = useAdminStore()
const router = useRouter()

const showRejectModal = ref(false)
const showDeleteModal = ref(false)
const rejectReason = ref('')
const selectedArticle = ref(null)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)

const rejectDisabled = computed(() => rejectReason.value.trim().length < 5)

// Pagination computed properties
const totalItems = computed(() => adminStore.articles.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return adminStore.articles.slice(start, end)
})

const hasPrevPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1
  const end = Math.min(currentPage.value * itemsPerPage.value, totalItems.value)
  return { start, end }
})

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    scrollToTop()
  }
}

const prevPage = () => {
  if (hasPrevPage.value) {
    currentPage.value--
    scrollToTop()
  }
}

const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++
    scrollToTop()
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Reset to page 1 when filter changes
const loadArticles = async (status) => {
  currentPage.value = 1
  await adminStore.fetchArticles(status)
}

const viewArticle = (id) => router.push(`/admin/articles/detail/${id}`)

/** ===== Reject ===== */
const openReject = (a) => {
  selectedArticle.value = a
  rejectReason.value = ''
  showRejectModal.value = true
}
const closeRejectModal = () => {
  showRejectModal.value = false
  selectedArticle.value = null
  rejectReason.value = ''
}
const confirmReject = async () => {
  if (!selectedArticle.value) return
  const reason = rejectReason.value.trim()
  if (reason.length < 5) return

  await adminStore.rejectArticle(selectedArticle.value.id, reason)
  closeRejectModal()

  // pastikan list sesuai filter saat ini
  await adminStore.fetchArticles(adminStore.filters.status)
}

/** ===== Delete ===== */
const openDelete = (a) => {
  selectedArticle.value = a
  showDeleteModal.value = true
}
const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedArticle.value = null
}
const confirmDelete = async () => {
  if (!selectedArticle.value) return

  await adminStore.deleteArticle(selectedArticle.value.id)
  closeDeleteModal()

  // store sudah remove dari state, tapi ini bikin aman kalau backend ada perubahan
  await adminStore.fetchArticles(adminStore.filters.status)
}

/** ===== Approve ===== */
const approve = async (id) => {
  await adminStore.approveArticle(id)
  await adminStore.fetchArticles(adminStore.filters.status)
}

onMounted(() => {
  adminStore.fetchArticles('all')
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header Section -->
      <header class="space-y-1">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Article Moderation</h1>
            <p class="text-sm text-gray-600 mt-1">Review, approve, and manage all articles</p>
          </div>

          <div class="flex items-center gap-3">
            <!-- ✅ Filter Status -->
            <div class="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div class="text-xs text-gray-500">Filter</div>
              <select
                class="mt-1 text-sm font-semibold text-gray-900 bg-transparent outline-none"
                :value="adminStore.filters.status"
                @change="loadArticles($event.target.value)"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <!-- Items Per Page -->
            <div class="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div class="text-xs text-gray-500">Per Page</div>
              <select
                v-model.number="itemsPerPage"
                @change="currentPage = 1"
                class="mt-1 text-sm font-semibold text-gray-900 bg-transparent outline-none"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>

            <!-- ✅ Total count sesuai filter -->
            <div class="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div class="text-xs text-gray-500">Total</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ adminStore.articles.length }}
              </div>
            </div>

            <button
              @click="adminStore.fetchArticles(adminStore.filters.status)"
              :disabled="adminStore.loading.global"
              class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                class="w-4 h-4"
                :class="{ 'animate-spin': adminStore.loading.global }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>

      <!-- Pagination Info Bar -->
      <div
        v-if="!adminStore.loading.global && adminStore.articles.length > 0"
        class="flex items-center justify-between px-1"
      >
        <div class="text-sm text-gray-600">
          Showing
          <span class="font-semibold text-gray-900">{{ paginationInfo.start }}</span>
          to
          <span class="font-semibold text-gray-900">{{ paginationInfo.end }}</span>
          of
          <span class="font-semibold text-gray-900">{{ totalItems }}</span>
          {{ totalItems === 1 ? 'article' : 'articles' }}
        </div>

        <div class="text-sm text-gray-500">Page {{ currentPage }} of {{ totalPages }}</div>
      </div>

      <!-- Content -->
      <div class="space-y-4">
        <!-- Loading State -->
        <div
          v-if="adminStore.loading.global && adminStore.articles.length === 0"
          class="bg-white rounded-2xl border border-gray-200 shadow-sm p-12"
        >
          <div class="flex flex-col items-center justify-center text-center space-y-4">
            <div
              class="w-12 h-12 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin"
            />
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Loading articles...</h3>
              <p class="text-sm text-gray-600 mt-1">Please wait while we fetch articles</p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="adminStore.articles.length === 0"
          class="bg-white rounded-2xl border border-gray-200 shadow-sm p-12"
        >
          <div class="flex flex-col items-center justify-center text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <svg
                class="w-8 h-8 text-green-600"
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
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">No articles found</h3>
              <p class="text-sm text-gray-600 mt-1">Try changing the filter</p>
            </div>
          </div>
        </div>

        <!-- Articles List -->
        <div v-else class="space-y-4">
          <div
            v-for="a in paginatedArticles"
            :key="a.id"
            class="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div class="p-6 lg:p-7">
              <div class="flex flex-col lg:flex-row lg:items-start gap-6">
                <!-- Content -->
                <div class="flex-1 min-w-0 space-y-4">
                  <!-- Meta -->
                  <div class="flex flex-wrap items-center gap-3">
                    <!-- ✅ Badge status dinamis -->
                    <span
                      class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border"
                      :class="{
                        'bg-yellow-50 text-yellow-800 border-yellow-200': a.status === 'pending',
                        'bg-green-50 text-green-800 border-green-200': a.status === 'approved',
                        'bg-red-50 text-red-800 border-red-200': a.status === 'rejected',
                      }"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full"
                        :class="{
                          'bg-yellow-500': a.status === 'pending',
                          'bg-green-500': a.status === 'approved',
                          'bg-red-500': a.status === 'rejected',
                        }"
                      />
                      {{ a.status }}
                    </span>

                    <span
                      v-if="a.category"
                      class="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-full border border-gray-200"
                    >
                      {{ a.category }}
                    </span>

                    <span v-if="a.created_at" class="text-xs text-gray-500">
                      Submitted {{ new Date(a.created_at).toLocaleString() }}
                    </span>
                  </div>

                  <!-- Title -->
                  <div class="space-y-1">
                    <h2
                      class="text-xl font-bold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-2"
                    >
                      {{ a.title }}
                    </h2>
                    <p
                      v-if="a.author_name || a.user?.name || a.Author"
                      class="text-sm text-gray-600"
                    >
                      by
                      <span class="font-medium text-gray-800">
                        {{ a.author_name || a.user?.name || a.Author }}
                      </span>
                    </p>
                  </div>

                  <!-- Content Preview -->
                  <div
                    v-if="a.content || a.excerpt"
                    class="prose prose-sm max-w-none text-gray-700"
                  >
                    <p class="line-clamp-3">{{ a.content || a.excerpt }}</p>
                  </div>

                  <!-- Stats / Footer -->
                  <div class="flex flex-wrap items-center gap-4 pt-2">
                    <div class="flex items-center gap-2 text-xs text-gray-500">
                      <!-- <span>ID: {{ a.id }}</span> -->
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span class="text-sm text-gray-500"> {{ a?.views ?? 0 }} views </span>
                      <span class="text-sm text-gray-500"> {{ a?.likes ?? 0 }} likes </span>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex lg:flex-col gap-3 lg:min-w-[160px]">
                  <!-- ✅ Approve/Reject hanya untuk pending -->
                  <button
                    v-if="a.status === 'pending'"
                    @click="adminStore.approveArticle(a.id)"
                    :disabled="adminStore.loading.approve"
                    class="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span>{{ adminStore.loading.approve ? 'Processing...' : 'Approve' }}</span>
                  </button>

                  <button
                    v-if="a.status === 'pending'"
                    @click="openReject(a)"
                    :disabled="adminStore.loading.reject"
                    class="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-red-300 text-red-700 font-semibold rounded-xl hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Reject</span>
                  </button>

                  <!-- Delete Button (semua status) -->
                  <button
                    @click="openDelete(a)"
                    :disabled="adminStore.loading.global"
                    class="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Delete</span>
                  </button>

                  <!-- View Details Button -->
                  <button
                    @click="viewArticle(a.id)"
                    class="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <span class="text-sm">View</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div
        v-if="!adminStore.loading.global && totalPages > 1"
        class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <!-- Previous Button -->
        <button
          @click="prevPage"
          :disabled="!hasPrevPage"
          class="group inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm border border-gray-200 hover:border-gray-300"
        >
          <svg
            class="w-5 h-5 transition-transform group-hover:-translate-x-1 group-disabled:transform-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span class="hidden sm:inline">Previous</span>
          <span class="sm:hidden">Prev</span>
        </button>

        <!-- Page Numbers -->
        <div class="flex items-center gap-2">
          <button
            v-for="page in totalPages"
            :key="page"
            v-show="
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            "
            @click="goToPage(page)"
            class="px-4 py-2 rounded-xl font-semibold transition-all"
            :class="
              page === currentPage
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            "
          >
            {{ page }}
          </button>

          <!-- Ellipsis -->
          <span v-if="currentPage < totalPages - 2" class="px-2 text-gray-400 font-semibold">
            ...
          </span>
        </div>

        <!-- Next Button -->
        <button
          @click="nextPage"
          :disabled="!hasNextPage"
          class="group inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm border border-gray-200 hover:border-gray-300"
        >
          <span class="hidden sm:inline">Next</span>
          <span class="sm:hidden">Next</span>
          <svg
            class="w-5 h-5 transition-transform group-hover:translate-x-1 group-disabled:transform-none"
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

      <!-- Reject Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="showRejectModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            @click.self="closeRejectModal"
          >
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4" @click.stop>
              <!-- Modal Header -->
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">Reject Article</h3>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ selectedArticle?.title || '' }}
                  </p>
                </div>
                <button
                  @click="closeRejectModal"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
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

              <!-- Modal Body -->
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700">
                  Alasan Penolakan
                  <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="rejectReason"
                  rows="4"
                  placeholder="Contoh: Artikel kurang jelas, perlu sumber, formatting belum rapi..."
                  class="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  :class="{
                    'border-red-300 focus:ring-red-500':
                      rejectReason.length > 0 && rejectReason.trim().length < 5,
                  }"
                />
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">{{ rejectReason.trim().length }}/500</span>
                  <span
                    v-if="rejectReason.trim().length > 0 && rejectReason.trim().length < 5"
                    class="text-red-600 font-medium"
                  >
                    Minimal 5 karakter
                  </span>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  @click="closeRejectModal"
                  :disabled="adminStore.loading.reject"
                  class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  @click="confirmReject"
                  :disabled="rejectDisabled || adminStore.loading.reject"
                  class="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:from-red-400 disabled:to-red-400"
                >
                  <span v-if="!adminStore.loading.reject">Reject Article</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <svg
                      class="w-4 h-4 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Delete Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="showDeleteModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            @click.self="closeDeleteModal"
          >
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4" @click.stop>
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">Delete Article</h3>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ selectedArticle?.title || '' }}
                  </p>
                </div>
                <button
                  @click="closeDeleteModal"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
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

              <div class="space-y-2">
                <div class="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p class="text-sm text-red-800">
                    Artikel akan <span class="font-semibold">dihapus permanen</span> dan tidak bisa
                    dikembalikan.
                  </p>
                </div>
                <p class="text-xs text-gray-500">
                  Tips: gunakan reject jika hanya ingin menolak, bukan menghapus.
                </p>
              </div>

              <div class="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  @click="closeDeleteModal"
                  :disabled="adminStore.loading.global"
                  class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  @click="confirmDelete"
                  :disabled="adminStore.loading.global"
                  class="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:from-red-400 disabled:to-red-400"
                >
                  <span v-if="!adminStore.loading.global">Delete</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <svg
                      class="w-4 h-4 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
