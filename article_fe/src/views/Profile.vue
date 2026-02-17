<!-- Profile.vue -->
<script setup>
import { onMounted, ref, computed } from 'vue'
import { useProfileStore } from '../stores/profile.store'
import { useAuthStore } from '../stores/auth.store'
import { useRouter, useRoute } from 'vue-router'
import { requestActivationApi } from '@/api/activation.api'

const profileStore = useProfileStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

/* ─── Navigation ──────────────────────────────────────────────────────── */
const isFromAdmin = computed(
  () =>
    authStore.user?.role === 'admin' &&
    (route.query.from === 'admin' || document.referrer.includes('/admin')),
)

const goBack = () => router.push(isFromAdmin.value ? '/admin' : '/')

/* ─── Profile shortcuts ───────────────────────────────────────────────── */
const profile = computed(() => profileStore.profile)
const status = computed(() => profile.value?.status)
const isActive = computed(() => status.value === 'active')

/* ─── Avatar ──────────────────────────────────────────────────────────── */
const avatarInput = ref(null)
const uploadingAvatar = ref(false)
const avatarUrl = computed(() => profile.value?.avatar || null)

const onAvatarChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  uploadingAvatar.value = true
  try {
    await profileStore.uploadAvatar(file)
    if (profile.value?.avatar) {
      authStore.user = { ...authStore.user, avatar: profile.value.avatar }
    }
  } catch (err) {
    console.error('Avatar upload failed:', err)
  } finally {
    uploadingAvatar.value = false
  }
}

const deleteAvatar = async () => {
  if (!confirm('Remove your avatar?')) return
  await profileStore.deleteAvatar()
  authStore.user = { ...authStore.user, avatar: null }
}

/* ─── Edit Profile ────────────────────────────────────────────────────── */
const isEditingProfile = ref(false)
const editError = ref('')
const editForm = ref({ fullname: '', email: '' })

const startEditProfile = () => {
  editForm.value = { fullname: profile.value?.fullname || '', email: profile.value?.email || '' }
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
  } catch (err) {
    editError.value = err.response?.data?.message || 'Failed to update profile'
  }
}

/* ─── Change Password ─────────────────────────────────────────────────── */
const isChangingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)
const passwordForm = ref({ old_password: '', new_password: '', confirm_password: '' })

const startChangePassword = () => {
  passwordForm.value = { old_password: '', new_password: '', confirm_password: '' }
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

  const { old_password, new_password, confirm_password } = passwordForm.value
  if (!old_password || !new_password) {
    passwordError.value = 'All fields are required'
    return
  }
  if (new_password.length < 6) {
    passwordError.value = 'New password must be at least 6 characters'
    return
  }
  if (new_password !== confirm_password) {
    passwordError.value = 'Passwords do not match'
    return
  }

  try {
    await profileStore.changePassword({ old_password, new_password })
    passwordSuccess.value = true
    setTimeout(() => {
      isChangingPassword.value = false
    }, 2000)
  } catch (err) {
    passwordError.value = err.response?.data?.message || 'Failed to change password'
  }
}

/* ─── Activation Request ──────────────────────────────────────────────── */
const activationReason = ref('')
const activationLoading = ref(false)
const activationDone = ref(false)

const requestActivation = async () => {
  if (!activationReason.value.trim()) return
  activationLoading.value = true
  try {
    await requestActivationApi(activationReason.value)
    activationDone.value = true
    activationReason.value = ''
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to submit request')
  } finally {
    activationLoading.value = false
  }
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const statusBadge = computed(
  () =>
    ({
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      suspended: 'bg-amber-50 text-amber-700 border-amber-200',
      banned: 'bg-red-50 text-red-700 border-red-200',
    })[status.value] || 'bg-slate-50 text-slate-600 border-slate-200',
)

const statusDot = computed(
  () =>
    ({
      active: 'bg-emerald-500',
      suspended: 'bg-amber-500',
      banned: 'bg-red-500',
    })[status.value] || 'bg-slate-400',
)

const statusLabel = computed(
  () =>
    ({
      active: 'Active',
      suspended: 'Suspended',
      banned: 'Permanently Banned',
    })[status.value] || status.value,
)

const roleBadge = (role) =>
  ({
    admin: 'bg-violet-50 text-violet-700 border-violet-200',
    author: 'bg-blue-50 text-blue-700 border-blue-200',
    user: 'bg-slate-50 text-slate-600 border-slate-200',
  })[role?.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-200'

const articleStatusBadge = (s) =>
  ({
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    draft: 'bg-slate-50 text-slate-600 border-slate-200',
  })[s?.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-200'

const initials = computed(() =>
  profile.value?.fullname
    ? profile.value.fullname
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : profile.value?.email?.charAt(0).toUpperCase() || 'U',
)

const articleCount = computed(() => profileStore.myArticles?.length || 0)
const approvedCount = computed(
  () =>
    profileStore.myArticles?.filter((a) => a.status === 'approved' || a.status === 'published')
      .length || 0,
)

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

onMounted(() => {
  profileStore.fetchProfile()
  profileStore.fetchMyArticles()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- ── Page ──────────────────────────────────────────────────────── -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {{ isFromAdmin ? 'Back to Admin Panel' : 'Back to Home' }}
      </button>

      <!-- ── Loading ─────────────────────────────────────────────────── -->
      <div v-if="profileStore.loading" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          class="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 animate-pulse shadow-sm"
        >
          <div class="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4"></div>
          <div class="h-5 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
          <div class="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
        </div>
        <div
          class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 animate-pulse shadow-sm"
        >
          <div class="h-5 bg-slate-200 rounded w-32 mb-4"></div>
          <div class="space-y-3">
            <div class="h-14 bg-slate-100 rounded-xl"></div>
            <div class="h-14 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      </div>

      <!-- ── Main Content ────────────────────────────────────────────── -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- ════════════════════════════════════════════════════════════ -->
        <!-- LEFT COLUMN                                                  -->
        <!-- ════════════════════════════════════════════════════════════ -->
        <div class="lg:col-span-1 space-y-4">
          <!-- Profile Card -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <!-- Cover band -->
            <div class="h-16 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"></div>

            <!-- Avatar (overlapping cover) -->
            <div class="px-6 pb-5">
              <div class="relative group -mt-10 mb-4 w-fit">
                <!-- Image or initials -->
                <div
                  class="w-20 h-20 rounded-2xl shadow-md border-4 border-white overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center"
                >
                  <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    alt="Avatar"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-white font-bold text-2xl select-none">{{
                    initials
                  }}</span>
                </div>

                <!-- Hover overlay -->
                <div
                  class="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1.5"
                >
                  <button
                    @click="() => avatarInput.click()"
                    :disabled="uploadingAvatar"
                    class="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    title="Upload"
                  >
                    <svg
                      v-if="!uploadingAvatar"
                      class="w-3.5 h-3.5 text-slate-700"
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
                      class="w-3.5 h-3.5 text-slate-700 animate-spin"
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
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </button>
                  <button
                    v-if="avatarUrl"
                    @click="deleteAvatar"
                    class="p-1.5 bg-red-500/90 rounded-lg hover:bg-red-500 transition-colors"
                    title="Remove"
                  >
                    <svg
                      class="w-3.5 h-3.5 text-white"
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

                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  @change="onAvatarChange"
                  class="hidden"
                />
              </div>

              <!-- Name + email -->
              <div class="mb-4">
                <h2 class="text-lg font-bold text-slate-900 leading-tight">
                  {{ profile?.fullname || '—' }}
                </h2>
                <p class="text-sm text-slate-500 mt-0.5">{{ profile?.email }}</p>
              </div>

              <!-- Badges row -->
              <div class="flex flex-wrap gap-1.5 mb-5">
                <!-- Role -->
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border capitalize"
                  :class="roleBadge(profile?.role)"
                >
                  {{ profile?.role }}
                </span>

                <!-- Status -->
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border"
                  :class="statusBadge"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDot" />
                  {{ statusLabel }}
                </span>

                <!-- Violation count if > 0 -->
                <span
                  v-if="profile?.violation_count > 0"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border text-amber-700 bg-amber-50 border-amber-200"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  {{ profile.violation_count }} violation{{
                    profile.violation_count > 1 ? 's' : ''
                  }}
                </span>
              </div>

              <!-- Stats mini row -->
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p class="text-xl font-bold text-slate-900 leading-none">{{ articleCount }}</p>
                  <p class="text-[11px] text-slate-500 mt-1 font-medium">Articles</p>
                </div>
                <div class="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p class="text-xl font-bold text-emerald-600 leading-none">{{ approvedCount }}</p>
                  <p class="text-[11px] text-slate-500 mt-1 font-medium">Approved</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Settings Card -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Account Settings
            </h3>
            <div class="space-y-2">
              <button
                @click="startEditProfile"
                class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 hover:border-blue-200 transition-all text-sm font-semibold text-blue-700"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-sm font-semibold text-slate-700"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <!-- Activation Request — only when banned -->
          <div
            v-if="status === 'banned'"
            class="bg-white rounded-2xl border border-red-200 shadow-sm p-5 space-y-3"
          >
            <div class="flex items-start gap-2.5">
              <div class="p-2 bg-red-50 rounded-lg shrink-0">
                <svg
                  class="w-4 h-4 text-red-500"
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
                <p class="text-sm font-semibold text-red-800">Account Permanently Banned</p>
                <p class="text-xs text-red-500 mt-0.5">
                  You may submit a reactivation request below.
                </p>
              </div>
            </div>

            <div
              v-if="activationDone"
              class="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 text-xs font-semibold"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Request submitted successfully
            </div>

            <template v-else>
              <textarea
                v-model="activationReason"
                placeholder="Explain why your account should be reactivated…"
                rows="3"
                class="w-full px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-300 resize-none transition-all"
              />
              <button
                @click="requestActivation"
                :disabled="!activationReason.trim() || activationLoading"
                class="w-full py-2.5 text-xs font-semibold rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {{ activationLoading ? 'Submitting…' : 'Request Reactivation' }}
              </button>
            </template>
          </div>
        </div>

        <!-- ════════════════════════════════════════════════════════════ -->
        <!-- RIGHT COLUMN                                                 -->
        <!-- ════════════════════════════════════════════════════════════ -->
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <!-- Section header -->
            <div
              class="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between"
            >
              <div class="flex items-center gap-2.5">
                <div class="p-2 bg-blue-50 rounded-lg">
                  <svg
                    class="w-4 h-4 text-blue-600"
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
                </div>
                <h3 class="text-sm font-bold text-slate-800">My Articles</h3>
              </div>

              <router-link
                v-if="isActive"
                to="/write"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Article
              </router-link>

              <span
                v-else
                class="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
              >
                Writing disabled
              </span>
            </div>

            <!-- Empty State -->
            <div
              v-if="!profileStore.myArticles || profileStore.myArticles.length === 0"
              class="py-16 text-center"
            >
              <div
                class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <svg
                  class="w-6 h-6 text-slate-300"
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
              <p class="text-sm font-semibold text-slate-700">No articles yet</p>
              <p class="text-xs text-slate-400 mt-1 mb-5">Share your thoughts with the world.</p>
              <router-link
                v-if="isActive"
                to="/write"
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div v-else class="divide-y divide-slate-50">
              <div
                v-for="article in profileStore.myArticles"
                :key="article.id"
                class="group flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer"
                @click="router.push(`/articles/${article.id}`)"
              >
                <div class="flex-1 min-w-0">
                  <h4
                    class="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate leading-snug"
                  >
                    {{ article.title }}
                  </h4>
                  <div class="flex items-center flex-wrap gap-3 mt-1.5">
                    <span
                      v-if="article.category_name"
                      class="inline-flex items-center gap-1 text-[11px] text-slate-500"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {{ article.category_name }}
                    </span>
                    <span class="text-[11px] text-slate-400">{{
                      formatDate(article.created_at)
                    }}</span>
                    <span class="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {{ article?.views ?? 0 }}
                    </span>
                    <span class="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {{ article?.likes ?? 0 }}
                    </span>
                  </div>
                </div>

                <span
                  class="shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border capitalize"
                  :class="articleStatusBadge(article.status)"
                >
                  {{ article.status }}
                </span>
              </div>
            </div>

            <!-- Footer count -->
            <div
              v-if="profileStore.myArticles && profileStore.myArticles.length > 0"
              class="px-5 py-3 border-t border-slate-100 bg-slate-50/40"
            >
              <p class="text-xs text-slate-400">
                {{ articleCount }} article{{ articleCount !== 1 ? 's' : '' }} total ·
                {{ approvedCount }} approved
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- EDIT PROFILE MODAL                                                 -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="isEditingProfile"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          @click.self="cancelEditProfile"
        >
          <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5" @click.stop>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-slate-900">Edit Profile</h3>
              <button
                @click="cancelEditProfile"
                class="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg
                  class="w-4 h-4 text-slate-500"
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
              class="flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
            >
              <svg
                class="w-4 h-4 shrink-0 mt-0.5"
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
              {{ editError }}
            </div>

            <form @submit.prevent="saveProfile" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  v-model="editForm.fullname"
                  type="text"
                  required
                  placeholder="Your full name"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5"
                  >Email Address</label
                >
                <input
                  v-model="editForm.email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
              <div class="flex gap-2.5 pt-1">
                <button
                  type="button"
                  @click="cancelEditProfile"
                  class="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- CHANGE PASSWORD MODAL                                              -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="isChangingPassword"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          @click.self="cancelChangePassword"
        >
          <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5" @click.stop>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-slate-900">Change Password</h3>
              <button
                @click="cancelChangePassword"
                class="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg
                  class="w-4 h-4 text-slate-500"
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
              class="flex items-center gap-2.5 px-3.5 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Password changed successfully!
            </div>

            <div
              v-if="passwordError"
              class="flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
            >
              <svg
                class="w-4 h-4 shrink-0 mt-0.5"
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
              {{ passwordError }}
            </div>

            <form @submit.prevent="savePassword" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5"
                  >Current Password</label
                >
                <input
                  v-model="passwordForm.old_password"
                  type="password"
                  required
                  placeholder="Enter current password"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5"
                  >New Password</label
                >
                <input
                  v-model="passwordForm.new_password"
                  type="password"
                  required
                  placeholder="Enter new password"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
                <p class="mt-1.5 text-[11px] text-slate-400">Must be at least 6 characters</p>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5"
                  >Confirm New Password</label
                >
                <input
                  v-model="passwordForm.confirm_password"
                  type="password"
                  required
                  placeholder="Confirm new password"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  :class="{
                    'border-red-300 focus:border-red-400':
                      passwordForm.confirm_password &&
                      passwordForm.new_password !== passwordForm.confirm_password,
                  }"
                />
                <p
                  v-if="
                    passwordForm.confirm_password &&
                    passwordForm.new_password !== passwordForm.confirm_password
                  "
                  class="mt-1.5 text-[11px] text-red-500 font-medium"
                >
                  Passwords do not match
                </p>
              </div>
              <div class="flex gap-2.5 pt-1">
                <button
                  type="button"
                  @click="cancelChangePassword"
                  class="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="passwordSuccess"
                  class="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
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
