// admin/Users.vue
<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin.store'

const adminStore = useAdminStore()

// ─── State ───────────────────────────────────────────────────────────────────
const loadingUserId = ref(null)
const loadingRequestId = ref(null)
const loadingPage = ref(false)
const activeTab = ref('users') // 'users' | 'requests'
const isRefreshing = ref(false)
const lastRefreshed = ref(null)
const searchQuery = ref('')
const requestFilterStatus = ref('pending') // 'pending' | 'approved' | 'rejected'

// ─── Debounce search ─────────────────────────────────────────────────────────
let debounceTimer = null
const onSearch = (e) => {
  searchQuery.value = e.target.value
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    adminStore.fetchUsers(1, adminStore.usersMeta.limit, searchQuery.value)
  }, 350)
}
onUnmounted(() => clearTimeout(debounceTimer))

// ─── Refresh ─────────────────────────────────────────────────────────────────
const refresh = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    const limit = adminStore.usersMeta?.limit || 10
    const page = adminStore.usersMeta?.page || 1
    await Promise.all([
      adminStore.fetchDashboard(),
      adminStore.fetchUsers(page, limit, searchQuery.value),
      adminStore.fetchActivationRequests(),
    ])
    lastRefreshed.value = new Date()
  } finally {
    isRefreshing.value = false
  }
}

onMounted(refresh)

const formattedLastRefreshed = computed(() => {
  if (!lastRefreshed.value) return null
  return lastRefreshed.value.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
})

// ─── Pagination ───────────────────────────────────────────────────────────────
const goToPage = async (page) => {
  console.log('GO TO PAGE:', page)
  console.log('CURRENT META:', adminStore.usersMeta)
  if (loadingPage.value) return
  const { totalPages, limit } = adminStore.usersMeta
  if (page < 1 || page > totalPages) return
  loadingPage.value = true
  try {
    await adminStore.fetchUsers(page, limit, searchQuery.value)
  } finally {
    loadingPage.value = false
  }
}

const pageNumbers = computed(() => {
  const { page, totalPages } = adminStore.usersMeta
  const delta = 2
  const start = Math.max(1, page - delta)
  const end = Math.min(totalPages, page + delta)
  const range = []
  for (let i = start; i <= end; i++) range.push(i)
  return range
})

// ─── User Management ─────────────────────────────────────────────────────────
const punishUser = async (user) => {
  if (user.status === 'banned') return
  
  const reason = prompt(
    `Add violation to ${user.email}?\n\nSystem will auto suspend or permanently ban based on violation count.\n\nPlease enter a reason (min 5 characters):`
  )
  
  if (reason === null) return // user canceled
  if (!reason || reason.trim().length < 5) {
    alert('Reason must be at least 5 characters long.')
    return
  }
  
  loadingUserId.value = user.id
  try {
    await adminStore.blockUser(user.id, reason)
  } finally {
    loadingUserId.value = null
  }
}

const canPunish = (user) => user.status !== 'banned'
const isPermanentlyBanned = (user) => user.status === 'banned'

// ─── Activation Requests ──────────────────────────────────────────────────────
const pendingRequests = computed(
  () => adminStore.activationRequests?.filter((r) => r.status === 'pending') || [],
)
const approvedRequests = computed(
  () => adminStore.activationRequests?.filter((r) => r.status === 'approved') || [],
)
const rejectedRequests = computed(
  () => adminStore.activationRequests?.filter((r) => r.status === 'rejected') || [],
)

const filteredRequests = computed(() => {
  if (requestFilterStatus.value === 'approved') return approvedRequests.value
  if (requestFilterStatus.value === 'rejected') return rejectedRequests.value
  return pendingRequests.value
})

const approveRequest = async (request) => {
  if (!confirm(`Approve activation request from ${request.email || 'this user'}?`)) return
  loadingRequestId.value = request.id
  try {
    await adminStore.approveActivationRequest(request.id)
  } finally {
    loadingRequestId.value = null
  }
}

const rejectRequest = async (request) => {
  if (!confirm(`Reject activation request from ${request.email || 'this user'}?`)) return
  loadingRequestId.value = request.id
  try {
    await adminStore.rejectActivationRequest(request.id)
  } finally {
    loadingRequestId.value = null
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Stats dari adminStore.stats (backend) — fallback ke filter lokal jika belum ada
const totalActive = computed(
  () =>
    adminStore.stats?.activeUsers ??
    adminStore.users?.filter((u) => u.status === 'active').length ??
    0,
)
const totalSuspended = computed(
  () =>
    adminStore.stats?.suspendedUsers ??
    adminStore.users?.filter((u) => u.status === 'suspended').length ??
    0,
)

const totalBlocked = computed(
  () =>
    adminStore.stats?.blockedUsers ??
    adminStore.users?.filter((u) => u.status === 'suspended' || u.status === 'banned').length ??
    0,
)

// Pagination display info
const pageStart = computed(() => (adminStore.usersMeta.page - 1) * adminStore.usersMeta.limit + 1)
const pageEnd = computed(() =>
  Math.min(adminStore.usersMeta.page * adminStore.usersMeta.limit, adminStore.usersMeta.total),
)

// Request filter tab config
const requestTabs = [
  {
    key: 'pending',
    label: 'Pending',
    activeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    badgeClass: 'bg-amber-500',
  },
  {
    key: 'approved',
    label: 'Approved',
    activeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    badgeClass: 'bg-emerald-500',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    activeClass: 'bg-red-50 text-red-700 border border-red-200',
    badgeClass: 'bg-red-500',
  },
]
const requestTabCount = {
  pending: pendingRequests,
  approved: approvedRequests,
  rejected: rejectedRequests,
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto space-y-5">
      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p class="text-sm text-slate-500 mt-0.5">
            Manage user status, roles, and activation requests
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-if="formattedLastRefreshed"
            class="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 mr-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ formattedLastRefreshed }}
          </span>

          <button
            @click="refresh"
            :disabled="isRefreshing"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <svg
              class="w-3.5 h-3.5"
              :class="isRefreshing ? 'animate-spin' : ''"
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

          <div
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm"
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span class="text-xs font-bold text-slate-700">{{
              adminStore.usersMeta?.total || 0
            }}</span>
            <span class="text-xs text-slate-400">total</span>
          </div>
        </div>
      </header>

      <!-- ── Stats ───────────────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          class="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-sm"
        >
          <div class="p-2.5 bg-emerald-50 rounded-lg shrink-0">
            <svg
              class="w-4 h-4 text-emerald-600"
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
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active</p>
            <p class="text-xl font-bold text-slate-900 leading-none mt-0.5">{{ totalActive }}</p>
          </div>
        </div>
        <div
          class="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-sm"
        >
          <div class="p-2.5 bg-emerald-50 rounded-lg shrink-0">
            <svg
              class="w-4 h-4 text-yellow-600"
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
          </div>
          <div>
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suspended</p>
            <p class="text-xl font-bold text-slate-900 leading-none mt-0.5">{{ totalSuspended }}</p>
          </div>
        </div>

        <div
          class="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-sm"
        >
          <div class="p-2.5 bg-red-50 rounded-lg shrink-0">
            <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Blocked</p>
            <p class="text-xl font-bold text-slate-900 leading-none mt-0.5">{{ totalBlocked }}</p>
          </div>
        </div>

        <div
          class="rounded-xl p-4 border flex items-center gap-3 cursor-pointer transition-all shadow-sm select-none"
          :class="
            pendingRequests.length > 0
              ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/80'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          "
          @click="((activeTab = 'requests'), (requestFilterStatus = 'pending'))"
        >
          <div
            class="p-2.5 rounded-lg shrink-0"
            :class="pendingRequests.length > 0 ? 'bg-amber-200' : 'bg-amber-50'"
          >
            <svg
              class="w-4 h-4 text-amber-600"
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
          <div class="flex-1 min-w-0">
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending</p>
            <div class="flex items-center gap-2 mt-0.5">
              <p class="text-xl font-bold text-slate-900 leading-none">
                {{ pendingRequests.length }}
              </p>
              <span
                v-if="pendingRequests.length > 0"
                class="text-[10px] font-bold text-amber-700 bg-amber-200 px-1.5 py-0.5 rounded-full animate-pulse uppercase tracking-wide"
              >
                Review
              </span>
            </div>
          </div>
          <svg
            v-if="pendingRequests.length > 0"
            class="w-3.5 h-3.5 text-amber-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      <!-- ── Tabs ────────────────────────────────────────────────────────── -->
      <div class="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/70">
        <button
          @click="activeTab = 'users'"
          class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
          :class="
            activeTab === 'users'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          "
        >
          All Users
        </button>
        <button
          @click="activeTab = 'requests'"
          class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
          :class="
            activeTab === 'requests'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          "
        >
          Activation Requests
          <span
            v-if="pendingRequests.length > 0"
            class="text-[10px] font-bold text-white bg-amber-500 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none"
          >
            {{ pendingRequests.length }}
          </span>
        </button>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB: ALL USERS                                                      -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div
        v-if="activeTab === 'users'"
        class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
      >
        <!-- Toolbar -->
        <div
          class="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
        >
          <h3 class="text-sm font-semibold text-slate-800">All Users</h3>
          <div class="relative">
            <input
              :value="searchQuery"
              @input="onSearch"
              type="text"
              placeholder="Search by email or name…"
              class="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all w-56"
            />
            <svg
              class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
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
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/40">
                <th
                  class="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  class="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  class="px-5 py-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  class="px-5 py-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Violations
                </th>
                <th
                  class="px-5 py-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-5 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>

            <!-- Skeleton while paginating -->
            <tbody v-if="loadingPage" class="divide-y divide-slate-50">
              <tr v-for="n in adminStore.usersMeta.limit" :key="n" class="animate-pulse">
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-slate-200 rounded-full shrink-0"></div>
                    <div class="space-y-1.5">
                      <div class="h-3 w-36 bg-slate-200 rounded"></div>
                      <div class="h-2 w-16 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3.5"><div class="h-3 w-24 bg-slate-200 rounded"></div></td>
                <td class="px-5 py-3.5 text-center">
                  <div class="h-5 w-14 bg-slate-200 rounded-md mx-auto"></div>
                </td>
                <td class="px-5 py-3.5 text-center">
                  <div class="h-5 w-8 bg-slate-200 rounded-md mx-auto"></div>
                </td>
                <td class="px-5 py-3.5 text-center">
                  <div class="h-5 w-16 bg-slate-200 rounded-md mx-auto"></div>
                </td>
                <td class="px-5 py-3.5 text-right">
                  <div class="h-7 w-24 bg-slate-200 rounded-lg ml-auto"></div>
                </td>
              </tr>
            </tbody>

            <!-- Data rows -->
            <tbody v-else class="divide-y divide-slate-50">
              <tr
                v-for="u in adminStore.users"
                :key="u.id"
                class="hover:bg-slate-50/60 transition-colors"
              >
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                    >
                      <span class="text-xs font-bold text-white">{{
                        u.email.charAt(0).toUpperCase()
                      }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-slate-800">{{ u.email }}</p>
                      <p class="text-[11px] text-slate-400">ID: {{ u.id }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-5 py-3.5 whitespace-nowrap">
                  <p class="text-sm text-slate-600">{{ u.fullname || '—' }}</p>
                </td>

                <td class="px-5 py-3.5 whitespace-nowrap text-center">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 capitalize"
                  >
                    {{ u.role }}
                  </span>
                </td>

                <td class="px-5 py-3.5 whitespace-nowrap text-center">
                  <span
                    class="inline-flex items-center justify-center min-w-[26px] h-[22px] px-2 rounded-md text-[11px] font-bold tabular-nums"
                    :class="
                      u.violation_count > 0
                        ? 'text-amber-700 bg-amber-50 border border-amber-200'
                        : 'text-slate-400 bg-slate-50 border border-slate-100'
                    "
                    >{{ u.violation_count }}</span
                  >
                </td>

                <td class="px-5 py-3.5 whitespace-nowrap text-center">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border capitalize"
                    :class="{
                      'text-emerald-700 bg-emerald-50 border-emerald-200': u.status === 'active',
                      'text-amber-700   bg-amber-50   border-amber-200': u.status === 'suspended',
                      'text-red-700     bg-red-50     border-red-200': u.status === 'banned',
                    }"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full shrink-0"
                      :class="{
                        'bg-emerald-500': u.status === 'active',
                        'bg-amber-500': u.status === 'suspended',
                        'bg-red-500': u.status === 'banned',
                      }"
                    />
                    {{ u.status }}
                  </span>
                </td>

                <td class="px-5 py-3.5 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      v-if="canPunish(u)"
                      @click="punishUser(u)"
                      :disabled="loadingUserId === u.id"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200 disabled:opacity-40 transition-colors"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2.5"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      {{ loadingUserId === u.id ? '…' : 'Add Violation' }}
                    </button>
                    <span
                      v-if="isPermanentlyBanned(u)"
                      class="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg"
                    >
                      Perm. Banned
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty -->
        <div
          v-if="!loadingPage && (!adminStore.users || adminStore.users.length === 0)"
          class="py-14 text-center"
        >
          <div
            class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <svg
              class="w-5 h-5 text-slate-300"
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
          <p class="text-sm font-medium text-slate-600">No users found</p>
          <p class="text-xs text-slate-400 mt-1">
            {{
              searchQuery
                ? `No results for "${searchQuery}"`
                : 'Users will appear here once registered'
            }}
          </p>
        </div>

        <!-- Pagination Footer -->
        <div
          v-if="!loadingPage && adminStore.users && adminStore.users.length > 0"
          class="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p class="text-xs text-slate-400 order-2 sm:order-1">
            Showing {{ pageStart }}–{{ pageEnd }} of {{ adminStore.usersMeta.total }} users
          </p>

          <div class="flex items-center gap-1 order-1 sm:order-2">
            <!-- Prev -->
            <button
              @click="goToPage(adminStore.usersMeta.page - 1)"
              :disabled="adminStore.usersMeta.page <= 1 || loadingPage"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Prev
            </button>

            <!-- Page numbers -->
            <button
              v-for="p in pageNumbers"
              :key="p"
              @click="goToPage(p)"
              :disabled="loadingPage"
              class="min-w-[30px] h-[30px] text-xs font-semibold rounded-lg border transition-all"
              :class="
                p === adminStore.usersMeta.page
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              "
            >
              {{ p }}
            </button>

            <!-- Next -->
            <button
              @click="goToPage(adminStore.usersMeta.page + 1)"
              :disabled="
                adminStore.usersMeta.page >= adminStore.usersMeta.totalPages || loadingPage
              "
              class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <p v-if="formattedLastRefreshed" class="text-xs text-slate-400 order-3">
            Updated {{ formattedLastRefreshed }}
          </p>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB: ACTIVATION REQUESTS                                            -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div
        v-if="activeTab === 'requests'"
        class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
      >
        <!-- Toolbar -->
        <div
          class="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <h3 class="text-sm font-semibold text-slate-800">Activation Requests</h3>

          <div class="flex gap-0.5 bg-white border border-slate-200 p-0.5 rounded-lg">
            <button
              v-for="tab in requestTabs"
              :key="tab.key"
              @click="requestFilterStatus = tab.key"
              class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5"
              :class="
                requestFilterStatus === tab.key
                  ? tab.activeClass + ' shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              "
            >
              {{ tab.label }}
              <span
                class="text-[10px] font-bold text-white rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none"
                :class="tab.badgeClass"
              >
                {{ requestTabCount[tab.key].value.length }}
              </span>
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/40">
                <th
                  class="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  class="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Reason
                </th>
                <th
                  class="px-5 py-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-5 py-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Requested
                </th>
                <th
                  class="px-5 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="req in filteredRequests"
                :key="req.id"
                class="hover:bg-slate-50/60 transition-colors"
                :class="{ 'bg-amber-50/20': req.status === 'pending' }"
              >
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                    >
                      <span class="text-xs font-bold text-white">
                        {{ (req.email || req.user_id?.toString() || '?').charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-slate-800">{{ req.email || '—' }}</p>
                      <p class="text-[11px] text-slate-400">ID: {{ req.user_id }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-5 py-3.5 max-w-xs">
                  <p v-if="req.reason" class="text-xs text-slate-600 truncate" :title="req.reason">
                    {{ req.reason }}
                  </p>
                  <em v-else class="text-xs text-slate-300">No reason provided</em>
                </td>

                <td class="px-5 py-3.5 whitespace-nowrap text-center">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border capitalize"
                    :class="{
                      'text-amber-700   bg-amber-50   border-amber-200': req.status === 'pending',
                      'text-emerald-700 bg-emerald-50 border-emerald-200':
                        req.status === 'approved',
                      'text-red-700     bg-red-50     border-red-200': req.status === 'rejected',
                    }"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full shrink-0"
                      :class="{
                        'bg-amber-500': req.status === 'pending',
                        'bg-emerald-500': req.status === 'approved',
                        'bg-red-500': req.status === 'rejected',
                      }"
                    />
                    {{ req.status }}
                  </span>
                </td>

                <td class="px-5 py-3.5 whitespace-nowrap text-center">
                  <p class="text-[11px] text-slate-500">{{ formatDate(req.created_at) }}</p>
                </td>

                <td class="px-5 py-3.5 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <template v-if="req.status === 'pending'">
                      <button
                        @click="approveRequest(req)"
                        :disabled="loadingRequestId === req.id"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 disabled:opacity-40 transition-colors"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {{ loadingRequestId === req.id ? '…' : 'Approve' }}
                      </button>
                      <button
                        @click="rejectRequest(req)"
                        :disabled="loadingRequestId === req.id"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border text-red-700 bg-red-50 hover:bg-red-100 border-red-200 disabled:opacity-40 transition-colors"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        {{ loadingRequestId === req.id ? '…' : 'Reject' }}
                      </button>
                    </template>

                    <span
                      v-else-if="req.status === 'approved'"
                      class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Approved
                    </span>

                    <span
                      v-else-if="req.status === 'rejected'"
                      class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2.5"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Rejected
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty -->
        <div v-if="filteredRequests.length === 0" class="py-14 text-center">
          <div
            class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <svg
              class="w-5 h-5 text-slate-300"
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
          <p class="text-sm font-medium text-slate-600">No {{ requestFilterStatus }} requests</p>
          <p class="text-xs text-slate-400 mt-1">
            <template v-if="requestFilterStatus === 'pending'"
              >All caught up — no pending reviews.</template
            >
            <template v-else-if="requestFilterStatus === 'approved'"
              >No approved requests yet.</template
            >
            <template v-else>No rejected requests yet.</template>
          </p>
        </div>

        <!-- Footer -->
        <div
          v-if="filteredRequests.length > 0"
          class="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between"
        >
          <p class="text-xs text-slate-400">
            {{ filteredRequests.length }} {{ requestFilterStatus }} request(s)
          </p>
          <p class="text-xs text-slate-400">
            {{ adminStore.activationRequests?.length || 0 }} total
          </p>
        </div>
      </div>

      <!-- ── Info Banner ─────────────────────────────────────────────────── -->
      <div class="flex items-start gap-3 bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-3">
        <svg
          class="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5"
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
        <p class="text-xs text-blue-600">
          Use <strong>Activation Requests</strong> to approve or reject account activation requests.
          In <strong>All Users</strong>, use <em>Add Violation</em> to trigger auto-suspend or
          permanent ban based on violation count.
        </p>
      </div>
    </div>
  </div>
</template>
