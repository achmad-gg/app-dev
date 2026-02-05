// admin/Users.vue
<script setup>
import { onMounted, ref } from 'vue'
import { useAdminStore } from '@/stores/admin.store'

const adminStore = useAdminStore()
const loadingUserId = ref(null)

onMounted(() => {
  adminStore.fetchDashboard()
})

const toggleStatus = async (u) => {
  if (!confirm(`Are you sure to ${u.is_active ? 'block' : 'activate'} this user?`)) return

  loadingUserId.value = u.id
  try {
    await adminStore.toggleUserStatus(u)
  } finally {
    loadingUserId.value = null
  }
}

const getRoleBadgeColor = (role) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    moderator: 'bg-blue-100 text-blue-700 border-blue-200',
    user: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  return colors[role] || colors.user
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
            <p class="text-sm text-gray-600 mt-1">Manage user status, roles, and permissions</p>
          </div>

          <!-- User Count -->
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
                {{ adminStore.users?.filter((u) => u.is_active).length || 0 }}
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
                {{ adminStore.users?.filter((u) => !u.is_active).length || 0 }}
              </p>
            </div>
          </div>
        </div>

        <!-- Admins -->
        <div class="bg-white rounded-xl p-5 border border-gray-200">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg
                class="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Admin Users</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ adminStore.users?.filter((u) => u.role === 'admin').length || 0 }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <!-- Table Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">All Users</h3>

            <!-- Search (Optional - for future enhancement) -->
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
                  class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Role
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
                <!-- User Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <!-- Avatar -->
                    <div
                      class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <span class="text-sm font-semibold text-white">
                        {{ u.email.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <!-- Email -->
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ u.email }}</p>
                      <p class="text-xs text-gray-500">ID: {{ u.id }}</p>
                    </div>
                  </div>
                </td>

                <!-- Role Badge -->
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    :class="getRoleBadgeColor(u.role)"
                    class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border capitalize"
                  >
                    {{ u.role }}
                  </span>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div
                      :class="u.is_active ? 'bg-green-500' : 'bg-red-500'"
                      class="w-2 h-2 rounded-full"
                    ></div>
                    <span
                      :class="
                        u.is_active
                          ? 'text-green-700 bg-green-50 border-green-200'
                          : 'text-red-700 bg-red-50 border-red-200'
                      "
                      class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border"
                    >
                      {{ u.is_active ? 'Active' : 'Blocked' }}
                    </span>
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    @click="toggleStatus(u)"
                    :disabled="loadingUserId === u.id"
                    :class="[
                      'inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
                      u.is_active
                        ? 'text-red-700 bg-red-50 hover:bg-red-100 border-red-200 focus:ring-red-500'
                        : 'text-green-700 bg-green-50 hover:bg-green-100 border-green-200 focus:ring-green-500',
                    ]"
                  >
                    <svg
                      v-if="u.is_active"
                      class="w-3.5 h-3.5"
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
                    <svg
                      v-else
                      class="w-3.5 h-3.5"
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
                    <span>{{ u.is_active ? 'Block' : 'Activate' }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="!adminStore.users || adminStore.users.length === 0" class="p-12">
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-900">No users found</p>
            <p class="text-xs text-gray-500 mt-1">Users will appear here once registered</p>
          </div>
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
              Click "Block" to suspend user access or "Activate" to restore it. Blocked users cannot
              login or perform actions until reactivated.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
