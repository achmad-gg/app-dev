<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

import GuestNavbar from '../components/navbar/GuestNavbar.vue'
import UserNavbar from '../components/navbar/UserNavbar.vue'
import Footer from '../components/Footer.vue'

const auth = useAuthStore()
const route = useRoute()

// const isAuthPage = computed(() => route.path.startsWith('/auth'))

const navbarComponent = computed(() => {
  if (route.path.startsWith('/auth')) return null
  if (!auth.isAuthenticated) return GuestNavbar
  if (auth.role === 'admin') return AdminNavbar
  return UserNavbar
})
</script>

<!-- <template> -->
<!-- <div class="min-h-screen flex flex-col"> -->
<!-- Navbar -->
<!-- <component v-if="navbarComponent" :is="navbarComponent" /> -->

<!-- <main class="flex-1"> -->
<!-- <RouterView /> -->
<!-- </main> -->

<!-- <Footer v-if="!isAuthPage" /> -->
<!-- </div> -->
<!-- </template> -->

<template>
  <component v-if="navbarComponent" :is="navbarComponent" />
  <RouterView />
  <Footer />
</template>
