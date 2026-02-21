// admin/Articles.vue
<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useRouter } from 'vue-router'

const adminStore = useAdminStore()
const router = useRouter()

/* ─────────────────────────────────────────────
   Status Meta Configuration
───────────────────────────────────────────── */
const statusMeta = {
  pending: {
    badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    dot: 'bg-yellow-500',
  },
  approved: {
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  rejected: {
    badge: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
}

/* ─────────────────────────────────────────────
   Modal State
───────────────────────────────────────────── */
const showRejectModal = ref(false)
const showDeleteModal = ref(false)
const rejectReason = ref('')
const deleteReason = ref('')
const selectedArticle = ref(null)
const isRefreshing = ref(false)

const rejectDisabled = computed(() => rejectReason.value.trim().length < 5)
const deleteDisabled = computed(() => deleteReason.value.trim().length < 5)

/* ─────────────────────────────────────────────
   Pagination — single source of truth (store)
   Semua computed baca dari meta, tidak ada
   perhitungan ulang di component.
───────────────────────────────────────────── */

// Satu alias ke meta — semua computed baca dari sini
const meta = computed(() => adminStore.articlesMeta)

const totalItems = computed(() => meta.value.total)
const totalPages = computed(() => meta.value.totalPages) // dari server, bukan Math.ceil
const hasPrevPage = computed(() => meta.value.page > 1)
const hasNextPage = computed(() => meta.value.page < meta.value.totalPages)

const rangeStart = computed(() =>
  totalItems.value === 0 ? 0 : (meta.value.page - 1) * meta.value.limit + 1,
)
const rangeEnd = computed(() => Math.min(meta.value.page * meta.value.limit, totalItems.value))

/* ─────────────────────────────────────────────
   Visible page numbers (dengan ellipsis)
───────────────────────────────────────────── */
const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = meta.value.page

  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set([1, total])
  for (let i = Math.max(2, cur - 2); i <= Math.min(total - 1, cur + 2); i++) {
    pages.add(i)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const result = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(null)
    result.push(sorted[i])
  }
  return result
})

/* ─────────────────────────────────────────────
   Pagination controls
   Mutasi page di store langsung, fetch sekali.
───────────────────────────────────────────── */
const goToPage = async (page) => {
  if (!page || page < 1 || page > totalPages.value) return
  adminStore.articlesMeta.page = page
  await adminStore.fetchArticles()
}

const prevPage = async () => {
  if (!hasPrevPage.value) return
  adminStore.articlesMeta.page--
  await adminStore.fetchArticles()
}

const nextPage = async () => {
  if (!hasNextPage.value) return
  adminStore.articlesMeta.page++
  await adminStore.fetchArticles()
}

/* ─────────────────────────────────────────────
   Filters & Refresh
───────────────────────────────────────────── */
const loadArticles = async (status) => {
  adminStore.articlesMeta.page = 1
  await adminStore.fetchArticles(status)
}

const handleRefresh = async () => {
  isRefreshing.value = true
  try {
    await adminStore.fetchArticles() // fetchArticles sudah baca filters.status dari store
  } finally {
    isRefreshing.value = false
  }
}

const viewArticle = (id) => router.push(`/admin/articles/detail/${id}`)

/* ─────────────────────────────────────────────
   Approve — optimistic, refetch hanya jika
   filter aktif = 'pending' (item harus hilang)
───────────────────────────────────────────── */
const approve = async (id) => {
  await adminStore.approveArticle(id)
  if (adminStore.filters.status === 'pending') {
    await adminStore.fetchArticles()
  }
}

/* ─────────────────────────────────────────────
   Reject Modal
───────────────────────────────────────────── */
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

// Optimistic: store sudah update status lokal.
// Refetch hanya jika filter = 'pending' agar item hilang dari list.
const confirmReject = async () => {
  if (!selectedArticle.value) return
  const reason = rejectReason.value.trim()
  if (reason.length < 5) return

  await adminStore.rejectArticle(selectedArticle.value.id, reason)
  closeRejectModal()

  if (adminStore.filters.status === 'pending') {
    await adminStore.fetchArticles()
  }
}

/* ─────────────────────────────────────────────
   Helper: Extract Plain Text from HTML
───────────────────────────────────────────── */
const getExcerptText = (content, fallback) => {
  if (!content) return fallback || '-'
  const div = document.createElement('div')
  div.innerHTML = content
  const text = div.textContent || div.innerText || ''
  return text.length > 150 ? text.slice(0, 150) + '...' : text
}

/* ─────────────────────────────────────────────
   Delete — edge-case safe, tanpa double-fetch
───────────────────────────────────────────── */
const openDelete = (a) => {
  selectedArticle.value = a
  deleteReason.value = ''
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedArticle.value = null
  deleteReason.value = ''
}

const confirmDelete = async () => {
  if (!selectedArticle.value) return
  const reason = deleteReason.value.trim()
  if (reason.length < 5) return

  await adminStore.deleteArticle(selectedArticle.value.id, reason)
  closeDeleteModal()

  // Edge case: hapus item terakhir di halaman non-pertama.
  // deleteArticle di store sudah update total → totalPages sudah ter-update.
  // Koreksi page dulu, BARU fetch — satu kali saja.
  const { page, totalPages: tp } = adminStore.articlesMeta
  if (page > tp && tp > 0) {
    adminStore.articlesMeta.page = tp
  }

  await adminStore.fetchArticles()
}

/* ─────────────────────────────────────────────── */
onMounted(() => adminStore.fetchArticles('all'))
</script>

<template>
  <div class="min-h-screen bg-gray-50/80 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto space-y-5">
      <!-- ── Header ─────────────────────────────────────────────────── -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Article Moderation</h1>
          <p class="text-sm text-gray-500 mt-0.5">Review, approve, and manage all articles</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Filter -->
          <div
            class="inline-flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <svg
              class="w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
              />
            </svg>
            <select
              class="text-xs font-semibold text-gray-700 bg-transparent outline-none cursor-pointer pr-1"
              :value="adminStore.filters.status"
              @change="loadArticles($event.target.value)"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <!-- Per page -->
          <div
            class="inline-flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <svg
              class="w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 10h16M4 14h10"
              />
            </svg>
            <select
              v-model.number="adminStore.articlesMeta.limit"
              @change="
                () => {
                  adminStore.articlesMeta.page = 1
                  adminStore.fetchArticles()
                }
              "
              class="text-xs font-semibold text-gray-700 bg-transparent outline-none cursor-pointer pr-1"
            >
              <option :value="10">10 / page</option>
              <option :value="20">20 / page</option>
              <option :value="50">50 / page</option>
            </select>
          </div>

          <!-- Count chip — total dari server, bukan .length array -->
          <div
            class="inline-flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <svg
              class="w-3.5 h-3.5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <span class="text-sm font-bold text-gray-800">{{ totalItems }}</span>
            <span class="text-xs text-gray-400">articles</span>
          </div>

          <!-- Refresh -->
          <button
            @click="handleRefresh"
            :disabled="isRefreshing || adminStore.loading.global"
            class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <svg
              class="w-4 h-4"
              :class="{ 'animate-spin': isRefreshing || adminStore.loading.global }"
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
            {{ isRefreshing ? 'Refreshing…' : 'Refresh' }}
          </button>
        </div>
      </header>

      <!-- ── Pagination info bar ────────────────────────────────────── -->
      <div
        v-if="!adminStore.loading.global && totalItems > 0"
        class="flex items-center justify-between text-xs text-gray-500 px-0.5"
      >
        <span>
          Showing
          <span class="font-semibold text-gray-700">{{ rangeStart }}–{{ rangeEnd }}</span>
          of
          <span class="font-semibold text-gray-700">{{ totalItems }}</span>
          {{ totalItems === 1 ? 'article' : 'articles' }}
        </span>
        <span class="text-gray-400">Page {{ meta.page }} / {{ totalPages }}</span>
      </div>

      <!-- ── Content ───────────────────────────────────────────────── -->
      <div class="space-y-3">
        <!-- Loading -->
        <div
          v-if="adminStore.loading.global && adminStore.articles.length === 0"
          class="bg-white rounded-2xl border border-gray-200 shadow-sm py-20 text-center"
        >
          <div
            class="w-10 h-10 rounded-full border-4 border-gray-200 border-t-indigo-500 animate-spin mx-auto mb-4"
          />
          <p class="text-sm font-medium text-gray-700">Loading articles…</p>
          <p class="text-xs text-gray-400 mt-1">Please wait</p>
        </div>

        <!-- Empty -->
        <div
          v-else-if="totalItems === 0"
          class="bg-white rounded-2xl border border-gray-200 shadow-sm py-20 text-center"
        >
          <div
            class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"
          >
            <svg
              class="w-6 h-6 text-gray-300"
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
          <p class="text-sm font-medium text-gray-700">No articles found</p>
          <p class="text-xs text-gray-400 mt-1">Try a different filter</p>
        </div>

        <!-- Article Cards -->
        <template v-else>
          <div
            v-for="a in adminStore.articles"
            :key="a.id"
            class="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all overflow-hidden"
          >
            <div class="p-5">
              <div class="flex flex-col lg:flex-row lg:items-start gap-5">
                <!-- ── Left: content ─────────────────────────────── -->
                <div class="flex-1 min-w-0 space-y-3">
                  <!-- Status + category + date -->
                  <div class="flex flex-wrap items-center gap-2">
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border capitalize"
                      :class="statusMeta[a.status]?.badge"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="statusMeta[a.status]?.dot" />
                      {{ a.status }}
                    </span>
                    <span
                      v-if="a.category"
                      class="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-600 text-[11px] font-medium rounded-md border border-gray-200"
                    >
                      {{ a.category }}
                    </span>
                    <span class="text-[11px] text-gray-400 ml-auto">
                      {{ a.created_at ? new Date(a.created_at).toLocaleString('id-ID') : '—' }}
                    </span>
                  </div>

                  <!-- Title + author -->
                  <div>
                    <h2
                      class="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug"
                    >
                      {{ a.title }}
                    </h2>
                    <p
                      v-if="a.author_name || a.user?.name || a.Author"
                      class="text-xs text-gray-500 mt-1"
                    >
                      by
                      <span class="font-medium text-gray-700">{{
                        a.author_name || a.user?.name || a.Author
                      }}</span>
                    </p>
                  </div>

                  <!-- Excerpt -->
                  <p
                    v-if="a.content || a.excerpt"
                    class="text-sm text-gray-600 line-clamp-2 leading-relaxed"
                  >
                    {{ getExcerptText(a.content, a.excerpt) }}
                  </p>

                  <!-- Stats -->
                  <div class="flex items-center gap-4 pt-1">
                    <div class="flex items-center gap-1 text-[11px] text-gray-400">
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {{ a?.views ?? 0 }} views
                    </div>
                    <div class="flex items-center gap-1 text-[11px] text-gray-400">
                      <svg
                        class="w-3.5 h-3.5"
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
                      {{ a?.likes ?? 0 }} likes
                    </div>
                    <span class="text-[11px] text-gray-300">ID: {{ a.id }}</span>
                  </div>
                </div>

                <!-- ── Right: actions ─────────────────────────────── -->
                <div class="flex lg:flex-col gap-2 lg:min-w-[130px] shrink-0">
                  <!-- Approve -->
                  <button
                    v-if="a.status === 'pending'"
                    @click="approve(a.id)"
                    :disabled="adminStore.loading.approve"
                    class="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {{ adminStore.loading.approve ? '…' : 'Approve' }}
                  </button>

                  <!-- Reject -->
                  <button
                    v-if="a.status === 'pending'"
                    @click="openReject(a)"
                    :disabled="adminStore.loading.reject"
                    class="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Reject
                  </button>

                  <!-- View -->
                  <button
                    @click="viewArticle(a.id)"
                    class="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View
                  </button>

                  <!-- Delete -->
                  <button
                    @click="openDelete(a)"
                    :disabled="adminStore.loading.delete"
                    class="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
          </div>
        </template>
      </div>

      <!-- ── Pagination Controls ────────────────────────────────────── -->
      <div
        v-if="!adminStore.loading.global && totalPages > 1"
        class="flex items-center justify-center gap-1.5 pt-2"
      >
        <!-- Prev -->
        <button
          @click="prevPage"
          :disabled="!hasPrevPage"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous page"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Prev
        </button>

        <!-- Page numbers with ellipsis -->
        <template v-for="(page, i) in visiblePages" :key="i">
          <span v-if="page === null" class="px-1.5 text-gray-400 text-sm select-none">…</span>
          <button
            v-else
            @click="goToPage(page)"
            class="min-w-[36px] h-9 px-2.5 rounded-lg text-xs font-semibold border transition-all"
            :class="
              page === meta.page
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            "
          >
            {{ page }}
          </button>
        </template>

        <!-- Next -->
        <button
          @click="nextPage"
          :disabled="!hasNextPage"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next page"
        >
          Next
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- ── Reject Modal ───────────────────────────────────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="showRejectModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            @click.self="closeRejectModal"
          >
            <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4" @click.stop>
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-base font-bold text-gray-900">Reject Article</h3>
                  <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {{ selectedArticle?.title }}
                  </p>
                </div>
                <button
                  @click="closeRejectModal"
                  class="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
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

              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-gray-700">
                  Rejection Reason <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="rejectReason"
                  rows="4"
                  placeholder="E.g. Article lacks credible sources, needs formatting improvements…"
                  class="w-full px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none transition-all"
                  :class="{
                    'border-red-300': rejectReason.length > 0 && rejectReason.trim().length < 5,
                  }"
                />
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-gray-400">{{ rejectReason.trim().length }} chars</span>
                  <span
                    v-if="rejectReason.trim().length > 0 && rejectReason.trim().length < 5"
                    class="text-red-500 font-medium"
                  >
                    Min. 5 characters
                  </span>
                </div>
              </div>

              <div class="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  @click="closeRejectModal"
                  :disabled="adminStore.loading.reject"
                  class="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="confirmReject"
                  :disabled="rejectDisabled || adminStore.loading.reject"
                  class="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
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
                    Processing…
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ── Delete Modal ───────────────────────────────────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="showDeleteModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            @click.self="closeDeleteModal"
          >
            <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4" @click.stop>
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-base font-bold text-gray-900">Delete Article</h3>
                  <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {{ selectedArticle?.title }}
                  </p>
                </div>
                <button
                  @click="closeDeleteModal"
                  class="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
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

              <div class="p-3.5 rounded-lg bg-red-50 border border-red-100">
                <p class="text-sm text-red-800">
                  This article will be <span class="font-semibold">permanently deleted</span> and
                  cannot be recovered. Use <em>Reject</em> instead if you only want to decline it.
                </p>
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-gray-700">
                  Deletion Reason <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="deleteReason"
                  rows="3"
                  placeholder="Reason for deletion (e.g. Inappropriate content, spam)…"
                  class="w-full px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none transition-all"
                  :class="{
                    'border-red-300': deleteReason.length > 0 && deleteReason.trim().length < 5,
                  }"
                />
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-gray-400">{{ deleteReason.trim().length }} chars</span>
                  <span
                    v-if="deleteReason.trim().length > 0 && deleteReason.trim().length < 5"
                    class="text-red-500 font-medium"
                  >
                    Min. 5 characters
                  </span>
                </div>
              </div>

              <div class="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  @click="closeDeleteModal"
                  :disabled="adminStore.loading.delete"
                  class="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="confirmDelete"
                  :disabled="deleteDisabled || adminStore.loading.delete"
                  class="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <span v-if="!adminStore.loading.delete">Delete</span>
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
                    Deleting…
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
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
