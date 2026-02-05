<script setup>
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const logout = () => {
  auth.logout()
  router.replace('/')
}
</script>

<template>
  <aside class="w-64 bg-gray-900 text-gray-200 h-screen fixed left-0 top-0 flex flex-col border-r border-gray-800">
    <!-- Brand -->
    <div class="h-16 flex items-center px-6 border-b border-gray-800">
      <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
        <span class="text-white font-bold">A</span>
      </div>
      <span class="font-semibold text-lg">Admin Panel</span>
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <RouterLink to="/admin" class="side-link" active-class="side-active">
        Dashboard
      </RouterLink>

      <RouterLink to="/admin/articles" class="side-link" active-class="side-active">
        Articles
      </RouterLink>

      <RouterLink to="/admin/users" class="side-link" active-class="side-active">
        Users
      </RouterLink>
    </nav>

    <!-- Logout -->
    <div class="p-4 border-t border-gray-800">
      <button
        @click="logout"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition"
      >
        Logout
      </button>
    </div>
  </aside>
</template>

<style scoped>
@reference "../../main.css";
.side-link {
  @apply block px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition;
}

.side-active {
  @apply bg-gray-800 text-white;
}
</style>
