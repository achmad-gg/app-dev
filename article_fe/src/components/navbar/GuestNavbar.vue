//GuestNavbar.vue
<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Brand -->
        <RouterLink to="/" class="flex items-center gap-3 group">
          <div class="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
            ArticleHub
          </span>
        </RouterLink>

        <!-- Desktop Navigation -->
        <div class="hidden sm:flex items-center gap-3">
          <RouterLink 
            to="/auth/login" 
            class="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            Login
          </RouterLink>
          <RouterLink
            to="/auth/register"
            class="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Get Started
          </RouterLink>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="sm:hidden py-4 space-y-2 border-t border-gray-200">
        <RouterLink 
          to="/auth/login" 
          class="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
        >
          Login
        </RouterLink>
        <RouterLink
          to="/auth/register"
          class="block px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium text-center rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          Get Started
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';

const mobileMenuOpen = ref(false);
</script>