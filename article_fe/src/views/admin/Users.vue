// admin/Users.vue
<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin.store'

const adminStore = useAdminStore()
const loadingUserId = ref(null)
const loadingRequestId = ref(null)
const activeTab = ref('users') // 'users' | 'requests'

onMounted(async () => {
  await adminStore.fetchDashboard()
  await adminStore.fetchActivationRequests()
})

// ─── User Management ────────────────────────────────────────────────────────

/**
 * Add violation (auto suspend or ban handled by backend)
 */
const punishUser = async (user) => {
  if (user.status === 'banned') return

  const confirmAction = confirm(
    `Add violation to ${user.email}?\n\nSystem will auto suspend or permanently ban based on violation count.`,
  )
  if (!confirmAction) return

  loadingUserId.value = user.id
  try {
    await adminStore.blockUser(user.id)
  } finally {
    loadingUserId.value = null
  }
}

/**
 * Manual Reactivation
 */
const activateUser = async (user) => {
  if (user.status === 'active') return

  const confirmActivate = confirm(`Reactivate ${user.email}?`)
  if (!confirmActivate) return

  loadingUserId.value = user.id
  try {
    await adminStore.activateUser(user.id)
  } finally {
    loadingUserId.value = null
  }
}

const canPunish = (user) => user.status !== 'banned'
const canActivate = (user) => user.status !== 'active'
const isPermanentlyBanned = (user) => user.status === 'banned'

// ─── Activation Requests ────────────────────────────────────────────────────

const pendingRequests = computed(
  () => adminStore.activationRequests?.filter((r) => r.status === 'pending') || [],
)

const approvedRequests = computed(
  () => adminStore.activationRequests?.filter((r) => r.status === 'approved') || [],
)

const rejectedRequests = computed(
  () => adminStore.activationRequests?.filter((r) => r.status === 'rejected') || [],
)

const requestFilterStatus = ref('pending') // 'pending' | 'approved' | 'rejected'

const filteredRequests = computed(() => {
  switch (requestFilterStatus.value) {
    case 'approved':
      return approvedRequests.value
    case 'rejected':
      return rejectedRequests.value
    default:
      return pendingRequests.value
  }
})

const approveRequest = async (request) => {
  const confirm_ = confirm(`Approve activation request from ${request.user?.email || 'this user'}?`)
  if (!confirm_) return

  loadingRequestId.value = request.id
  try {
    await adminStore.approveActivationRequest(request.id)
  } finally {
    loadingRequestId.value = null
  }
}

const rejectRequest = async (request) => {
  const confirm_ = confirm(`Reject activation request from ${request.user?.email || 'this user'}?`)
  if (!confirm_) return

  loadingRequestId.value = request.id
  try {
    await adminStore.rejectActivationRequest(request.id)
  } finally {
    loadingRequestId.value = null
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-325 mx-auto space-y-6">
      <!-- Header Section -->
      <header class="space-y-1">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
            <p class="text-sm text-gray-600 mt-1">
              Manage user status, roles, and activation requests
            </p>
          </div>

          <div class="flex items-center gap-3">
            <div class="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div class="flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-blue-600"
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
                <span class="text-sm font-semibold text-gray-700">
                  {{ adminStore.users?.length || 0 }} Users
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Active Users -->
        <div class="bg-white rounded-xl p-5 border border-gray-200">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg
                class="w-5 h-5 text-green-600"
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
              <p class="text-sm text-gray-600">Active Users</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ adminStore.users?.filter((u) => u.status === 'active').length || 0 }}
              </p>
            </div>
          </div>
        </div>

        <!-- Blocked Users -->
        <div class="bg-white rounded-xl p-5 border border-gray-200">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-red-100 rounded-lg">
              <svg
                class="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Blocked Users</p>
              <p class="text-2xl font-bold text-gray-900">
                {{
                  adminStore.users?.filter((u) => u.status === 'suspended' || u.status === 'banned')
                    .length || 0
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Pending Activation Requests -->
        <div
          class="bg-white rounded-xl p-5 border cursor-pointer transition-all"
          :class="
            pendingRequests.length > 0
              ? 'border-amber-300 bg-amber-50 shadow-amber-100 shadow-md'
              : 'border-gray-200'
          "
          @click="((activeTab = 'requests'), (requestFilterStatus = 'pending'))"
        >
          <div class="flex items-center gap-3">
            <div
              class="p-3 rounded-lg"
              :class="pendingRequests.length > 0 ? 'bg-amber-200' : 'bg-amber-100'"
            >
              <svg
                class="w-5 h-5 text-amber-600"
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
            <div>
              <p class="text-sm text-gray-600">Pending Requests</p>
              <div class="flex items-center gap-2">
                <p class="text-2xl font-bold text-gray-900">{{ pendingRequests.length }}</p>
                <span
                  v-if="pendingRequests.length > 0"
                  class="text-xs font-semibold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full animate-pulse"
                >
                  Needs Review
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          @click="activeTab = 'users'"
          :class="
            activeTab === 'users'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          "
          class="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
        >
          All Users
        </button>
        <button
          @click="activeTab = 'requests'"
          :class="
            activeTab === 'requests'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          "
          class="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
        >
          Activation Requests
          <span
            v-if="pendingRequests.length > 0"
            class="text-xs font-bold text-white bg-amber-500 rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
          >
            {{ pendingRequests.length }}
          </span>
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- TAB: ALL USERS                                                     -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div
        v-if="activeTab === 'users'"
        class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
      >
        <!-- Table Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">All Users</h3>
            <div class="hidden sm:flex items-center gap-2">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
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
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Violations
                </th>
                <th
                  class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="u in adminStore.users"
                :key="u.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <!-- Email -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <span class="text-sm font-semibold text-white">{{
                        u.email.charAt(0).toUpperCase()
                      }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ u.email }}</p>
                      <p class="text-xs text-gray-500">ID: {{ u.id }}</p>
                    </div>
                  </div>
                </td>
                <!-- Name -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm font-medium text-gray-900">{{ u.fullname || 'No Name' }}</p>
                </td>
                <!-- Role -->
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold text-blue-500 border capitalize"
                  >
                    {{ u.role }}
                  </span>
                </td>
                <!-- Violations -->
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold text-yellow-700 border border-yellow-500 bg-yellow-100 capitalize"
                  >
                    {{ u.violation_count }}
                  </span>
                </td>
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div
                      :class="{
                        'bg-green-500': u.status === 'active',
                        'bg-yellow-500': u.status === 'suspended',
                        'bg-red-500': u.status === 'banned',
                      }"
                      class="w-2 h-2 rounded-full"
                    ></div>
                    <span
                      :class="{
                        'text-green-700 bg-green-50 border-green-200': u.status === 'active',
                        'text-yellow-700 bg-yellow-50 border-yellow-200': u.status === 'suspended',
                        'text-red-700 bg-red-50 border-red-200': u.status === 'banned',
                      }"
                      class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border capitalize"
                    >
                      {{ u.status }}
                    </span>
                  </div>
                </td>
                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      v-if="canPunish(u)"
                      @click="punishUser(u)"
                      :disabled="loadingUserId === u.id"
                      class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border-yellow-200 disabled:opacity-50"
                    >
                      Add Violation
                    </button>
                    <button
                      v-if="canActivate(u)"
                      @click="activateUser(u)"
                      :disabled="loadingUserId === u.id"
                      class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border text-green-700 bg-green-50 hover:bg-green-100 border-green-200 disabled:opacity-50"
                    >
                      Activate
                    </button>
                    <span
                      v-if="isPermanentlyBanned(u)"
                      class="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-lg"
                    >
                      Permanently Banned
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="!adminStore.users || adminStore.users.length === 0" class="p-12 text-center">
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-900">No users found</p>
          <p class="text-xs text-gray-500 mt-1">Users will appear here once registered</p>
        </div>

        <!-- Table Footer -->
        <div
          v-if="adminStore.users && adminStore.users.length > 0"
          class="px-6 py-4 border-t border-gray-200 bg-gray-50"
        >
          <div class="flex items-center justify-between text-xs text-gray-600">
            <p>Showing {{ adminStore.users.length }} user(s)</p>
            <p>Last updated: Just now</p>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- TAB: ACTIVATION REQUESTS                                           -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div
        v-if="activeTab === 'requests'"
        class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 class="text-lg font-semibold text-gray-900">Activation Requests</h3>

            <!-- Filter Tabs -->
            <div class="flex gap-1 bg-white border border-gray-200 p-1 rounded-lg">
              <button
                @click="requestFilterStatus = 'pending'"
                :class="
                  requestFilterStatus === 'pending'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'text-gray-500 hover:text-gray-700'
                "
                class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                Pending
                <span
                  class="bg-amber-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                >
                  {{ pendingRequests.length }}
                </span>
              </button>
              <button
                @click="requestFilterStatus = 'approved'"
                :class="
                  requestFilterStatus === 'approved'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'text-gray-500 hover:text-gray-700'
                "
                class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                Approved
                <span
                  class="bg-green-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                >
                  {{ approvedRequests.length }}
                </span>
              </button>
              <button
                @click="requestFilterStatus = 'rejected'"
                :class="
                  requestFilterStatus === 'rejected'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'text-gray-500 hover:text-gray-700'
                "
                class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                Rejected
                <span
                  class="bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                >
                  {{ rejectedRequests.length }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Reason
                </th>
                <th
                  class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Requested At
                </th>
                <th
                  class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="req in filteredRequests"
                :key="req.id"
                class="hover:bg-gray-50 transition-colors"
                :class="{ 'bg-amber-50/40': req.status === 'pending' }"
              >
                <!-- User Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <span class="text-sm font-semibold text-white">
                        {{
                          (req.user?.email || req.user_id?.toString() || '?')
                            .charAt(0)
                            .toUpperCase()
                        }}
                      </span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ req.user?.email || '-' }}</p>
                      <p class="text-xs text-gray-500">User ID: {{ req.user_id }}</p>
                    </div>
                  </div>
                </td>

                <!-- Reason -->
                <td class="px-6 py-4 max-w-xs">
                  <p v-if="req.reason" class="text-sm text-gray-700 truncate" :title="req.reason">
                    {{ req.reason }}
                  </p>
                  <em v-else class="text-sm text-gray-400">No reason provided</em>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div
                      :class="{
                        'bg-amber-500': req.status === 'pending',
                        'bg-green-500': req.status === 'approved',
                        'bg-red-500': req.status === 'rejected',
                      }"
                      class="w-2 h-2 rounded-full"
                    ></div>
                    <span
                      :class="{
                        'text-amber-700 bg-amber-50 border-amber-200': req.status === 'pending',
                        'text-green-700 bg-green-50 border-green-200': req.status === 'approved',
                        'text-red-700 bg-red-50 border-red-200': req.status === 'rejected',
                      }"
                      class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border capitalize"
                    >
                      {{ req.status }}
                    </span>
                  </div>
                </td>

                <!-- Date -->
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <p class="text-xs text-gray-600">{{ formatDate(req.created_at) }}</p>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <!-- Pending: Approve + Reject -->
                    <template v-if="req.status === 'pending'">
                      <button
                        @click="approveRequest(req)"
                        :disabled="loadingRequestId === req.id"
                        class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border text-green-700 bg-green-50 hover:bg-green-100 border-green-200 disabled:opacity-50 transition-colors"
                      >
                        <svg
                          class="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Approve
                      </button>
                      <button
                        @click="rejectRequest(req)"
                        :disabled="loadingRequestId === req.id"
                        class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border text-red-700 bg-red-50 hover:bg-red-100 border-red-200 disabled:opacity-50 transition-colors"
                      >
                        <svg
                          class="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Reject
                      </button>
                    </template>

                    <!-- Approved -->
                    <span
                      v-else-if="req.status === 'approved'"
                      class="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-lg flex items-center gap-1.5"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Approved
                    </span>

                    <!-- Rejected -->
                    <span
                      v-else-if="req.status === 'rejected'"
                      class="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-lg flex items-center gap-1.5"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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

        <!-- Empty State -->
        <div v-if="filteredRequests.length === 0" class="p-12 text-center">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-900">No {{ requestFilterStatus }} requests</p>
          <p class="text-xs text-gray-500 mt-1">
            <template v-if="requestFilterStatus === 'pending'"
              >All requests have been reviewed.</template
            >
            <template v-else-if="requestFilterStatus === 'approved'"
              >No requests have been approved yet.</template
            >
            <template v-else>No requests have been rejected yet.</template>
          </p>
        </div>

        <!-- Table Footer -->
        <div
          v-if="filteredRequests.length > 0"
          class="px-6 py-4 border-t border-gray-200 bg-gray-50"
        >
          <div class="flex items-center justify-between text-xs text-gray-600">
            <p>Showing {{ filteredRequests.length }} {{ requestFilterStatus }} request(s)</p>
            <p>Total: {{ adminStore.activationRequests?.length || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Info Card -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <svg
            class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
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
            <p class="text-sm font-medium text-blue-900 mb-1">User Management Tips</p>
            <p class="text-xs text-blue-700">
              Use the <strong>Activation Requests</strong> tab to review and approve or reject user
              account activation requests. In <strong>All Users</strong>, click "Add Violation" to
              trigger auto-suspend/ban, or "Activate" to restore suspended accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
