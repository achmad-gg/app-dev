<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

import GuestNavbar from '../components/navbar/GuestNavbar.vue'
import UserNavbar from '../components/navbar/UserNavbar.vue'
import Footer from '../components/Footer.vue'

const auth = useAuthStore()
const route = useRoute()

const navbarComponent = computed(() => {
  if (route.path.startsWith('/auth')) return null
  if (!auth.isAuthenticated) return GuestNavbar
  return UserNavbar
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <component v-if="navbarComponent" :is="navbarComponent" />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

