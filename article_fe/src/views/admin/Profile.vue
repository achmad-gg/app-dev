<!-- admin/Profile.vue -->
<script setup>
import { onMounted, ref, computed } from 'vue'
import { useProfileStore } from '../../stores/profile.store'
import { useAuthStore } from '../../stores/auth.store'
import { useRouter, useRoute } from 'vue-router'

const profileStore = useProfileStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Check if user is admin and came from admin panel
const isFromAdmin = computed(() => {
  return authStore.user?.role === 'admin'
})

const goBack = () => {
  if (isFromAdmin.value) {
    router.push('/admin')
  } else {
    router.push('/')
  }
}

// Edit mode states
const isEditingProfile = ref(false)
const isChangingPassword = ref(false)

// Form data
const editForm = ref({
  fullname: '',
  email: '',
})

const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

// Error states
const editError = ref('')
const passwordError = ref('')
const passwordSuccess = ref(false)

// Avatar
const avatarInput = ref(null)
const uploadingAvatar = ref(false)

const avatarUrl = computed(() => profileStore.profile?.avatar || null)

const onAvatarChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  uploadingAvatar.value = true
  try {
    await profileStore.uploadAvatar(file)
    if (profileStore.profile?.avatar) {
      authStore.user = { ...authStore.user, avatar: profileStore.profile.avatar }
    }
  } catch (error) {
    console.error('Avatar upload failed:', error)
  } finally {
    uploadingAvatar.value = false
  }
}

const deleteAvatar = async () => {
  if (!confirm('Are you sure you want to remove your avatar?')) return
  await profileStore.deleteAvatar()
  authStore.user = { ...authStore.user, avatar: null }
}

const startEditProfile = () => {
  editForm.value = {
    fullname: profileStore.profile?.fullname || '',
    email: profileStore.profile?.email || '',
  }
  editError.value = ''
  isEditingProfile.value = true
}

const cancelEditProfile = () => {
  isEditingProfile.value = false
  editError.value = ''
}

const saveProfile = async () => {
  editError.value = ''

  if (!editForm.value.fullname || !editForm.value.email) {
    editError.value = 'All fields are required'
    return
  }

  try {
    await profileStore.updateProfile({
      fullname: editForm.value.fullname,
      email: editForm.value.email,
    })
    authStore.user = {
      ...authStore.user,
      fullname: editForm.value.fullname,
      email: editForm.value.email,
    }
    isEditingProfile.value = false
  } catch (error) {
    editError.value = error.response?.data?.message || 'Failed to update profile'
  }
}

const startChangePassword = () => {
  passwordForm.value = {
    old_password: '',
    new_password: '',
    confirm_password: '',
  }
  passwordError.value = ''
  passwordSuccess.value = false
  isChangingPassword.value = true
}

const cancelChangePassword = () => {
  isChangingPassword.value = false
  passwordError.value = ''
  passwordSuccess.value = false
}

const savePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = false

  if (!passwordForm.value.old_password || !passwordForm.value.new_password) {
    passwordError.value = 'All fields are required'
    return
  }

  if (passwordForm.value.new_password.length < 6) {
    passwordError.value = 'New password must be at least 6 characters'
    return
  }

  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    passwordError.value = 'Passwords do not match'
    return
  }

  try {
    await profileStore.changePassword({
      old_password: passwordForm.value.old_password,
      new_password: passwordForm.value.new_password,
    })
    passwordSuccess.value = true
    setTimeout(() => {
      isChangingPassword.value = false
    }, 2000)
  } catch (error) {
    passwordError.value = error.response?.data?.message || 'Failed to change password'
  }
}

onMounted(() => {
  profileStore.fetchProfile()
  profileStore.fetchMyArticles()
})

const getStatusColor = (status) => {
  const colors = {
    published: 'bg-green-100 text-green-700 border-green-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  }
  return colors[status?.toLowerCase()] || colors.draft
}

const getRoleDisplay = (role) => {
  const roles = {
    admin: { text: 'Administrator', color: 'bg-purple-100 text-purple-700' },
    user: { text: 'User', color: 'bg-blue-100 text-blue-700' },
    author: { text: 'Author', color: 'bg-green-100 text-green-700' },
  }
  return roles[role?.toLowerCase()] || roles.user
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Button -->
      <div class="mb-6">
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {{ isFromAdmin ? 'Back to Admin Panel' : 'Back to Home' }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="profileStore.loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div class="w-32 h-32 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div class="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div class="space-y-3">
              <div class="h-16 bg-gray-200 rounded"></div>
              <div class="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Profile Info -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Avatar & Basic Info Card -->
          <div class="bg-white rounded-2xl shadow-sm p-6">
            <!-- Avatar -->
            <div class="relative group mb-6">
              <div class="flex justify-center">
                <div
                  v-if="avatarUrl"
                  class="w-32 h-32 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden"
                >
                  <img :src="avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
                </div>
                <div
                  v-else
                  class="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center"
                >
                  <span class="text-white font-bold text-4xl">
                    {{ profileStore.profile?.email?.charAt(0).toUpperCase() || 'U' }}
                  </span>
                </div>
              </div>

              <!-- Avatar Upload Overlay -->
              <div
                class="absolute inset-0 ml-24 max-w-34 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div class="flex gap-2">
                  <button
                    @click="() => avatarInput.click()"
                    :disabled="uploadingAvatar"
                    class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    title="Upload Avatar"
                  >
                    <svg
                      v-if="!uploadingAvatar"
                      class="w-5 h-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-5 h-5 text-gray-700 animate-spin"
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
                  </button>

                  <button
                    v-if="avatarUrl"
                    @click="deleteAvatar"
                    class="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                    title="Remove Avatar"
                  >
                    <svg
                      class="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                @change="onAvatarChange"
                class="hidden"
              />
            </div>

            <!-- User Info -->
            <div class="text-center mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-1">
                {{ profileStore.profile?.fullname }}
              </h2>
              <p class="text-sm text-gray-600 mb-3">{{ profileStore.profile?.email }}</p>

              <div class="flex justify-center">
                <span
                  :class="getRoleDisplay(profileStore.profile?.role).color"
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                >
                  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  {{ getRoleDisplay(profileStore.profile?.role).text }}
                </span>
              </div>
            </div>

            <!-- Stats -->
            <div class="border-t border-gray-200 pt-4">
              <div class="text-center">
                <div class="text-3xl font-bold text-gray-900">
                  {{ profileStore.myArticles?.length || 0 }}
                </div>
                <div class="text-sm text-gray-600">Total Articles</div>
              </div>
            </div>
          </div>

          <!-- Profile Actions Card -->
          <div class="bg-white rounded-2xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>

            <div class="space-y-3">
              <button
                @click="startEditProfile"
                class="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all text-sm font-medium text-blue-700"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Edit Profile Info
              </button>

              <button
                @click="startChangePassword"
                class="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all text-sm font-medium text-gray-700"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Change Password
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column - Articles & Notifications -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Admin Notifications (only for admin) -->
          <div v-if="isFromAdmin" class="bg-white rounded-2xl shadow-sm p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              Notifications
            </h3>

            <div class="space-y-3">
              <!-- Sample Notifications -->
              <div class="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">System Update</p>
                  <p class="text-xs text-gray-600 mt-1">Your admin panel has been updated to the latest version.</p>
                </div>
              </div>

              <div class="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <svg class="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">Welcome Back!</p>
                  <p class="text-xs text-gray-600 mt-1">You've successfully logged into the admin panel.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- My Articles Section -->
          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                My Articles
              </h3>

              <router-link
                to="/write"
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Article
              </router-link>
            </div>

            <!-- Empty State -->
            <div
              v-if="!profileStore.myArticles || profileStore.myArticles.length === 0"
              class="text-center py-12"
            >
              <div
                class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-10 h-10 text-gray-400"
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
              <h4 class="text-lg font-semibold text-gray-900 mb-2">No articles yet</h4>
              <p class="text-gray-600 mb-6">
                Start writing your first article and share your thoughts.
              </p>
              <router-link
                to="/write"
                class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Write Your First Article
              </router-link>
            </div>

            <!-- Articles List -->
            <div v-else class="space-y-3">
              <div
                v-for="article in profileStore.myArticles"
                :key="article.id"
                class="group flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
                @click="router.push(`/articles/${article.id}`)"
              >
                <div class="flex-1 min-w-0">
                  <h4
                    class="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate"
                  >
                    {{ article.title }}
                  </h4>
                  <div class="flex items-center gap-3 text-sm text-gray-600">
                    <span v-if="article.category_name" class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {{ article.category_name }}
                    </span>
                    <span v-if="article.created_at" class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {{
                        new Date(article.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      }}
                    </span>
                  </div>
                </div>

                <span
                  :class="getStatusColor(article.status)"
                  class="px-3 py-1 text-xs font-semibold rounded-full border capitalize"
                >
                  {{ article.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Profile Modal -->
      <div
        v-if="isEditingProfile"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="cancelEditProfile"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">Edit Profile</h3>
            <button
              @click="cancelEditProfile"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                class="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div
            v-if="editError"
            class="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
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
            <p class="text-sm text-red-800">{{ editError }}</p>
          </div>

          <form @submit.prevent="saveProfile" class="space-y-5">
            <div>
              <label for="fullname" class="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullname"
                v-model="editForm.fullname"
                type="text"
                required
                class="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                v-model="editForm.email"
                type="email"
                required
                class="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="cancelEditProfile"
                class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Change Password Modal -->
      <div
        v-if="isChangingPassword"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="cancelChangePassword"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">Change Password</h3>
            <button
              @click="cancelChangePassword"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                class="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div
            v-if="passwordSuccess"
            class="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3"
          >
            <svg
              class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
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
            <p class="text-sm text-green-800">Password changed successfully!</p>
          </div>

          <div
            v-if="passwordError"
            class="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
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
            <p class="text-sm text-red-800">{{ passwordError }}</p>
          </div>

          <form @submit.prevent="savePassword" class="space-y-5">
            <div>
              <label for="old_password" class="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                id="old_password"
                v-model="passwordForm.old_password"
                type="password"
                required
                class="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label for="new_password" class="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="new_password"
                v-model="passwordForm.new_password"
                type="password"
                required
                class="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter new password"
              />
              <p class="mt-1.5 text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            <div>
              <label for="confirm_password" class="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirm_password"
                v-model="passwordForm.confirm_password"
                type="password"
                required
                class="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Confirm new password"
              />
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="cancelChangePassword"
                class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>