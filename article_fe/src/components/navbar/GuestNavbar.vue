<template>
  <nav class="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        <!-- Logo/Brand -->
        <RouterLink to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-md shadow-blue-500/20">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="font-bold text-2xl text-gray-900 tracking-tight group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
            ArticleHub
          </span>
        </RouterLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-6">
          <div class="flex items-center gap-1 mr-4">
            <RouterLink to="/" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-lg transition-colors">Home</RouterLink>
          </div>

          <RouterLink 
            to="/auth/login" 
            class="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
          >
            Sign In
          </RouterLink>
          <RouterLink
            to="/auth/register"
            class="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 bg-gray-900 rounded-full hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/30 overflow-hidden group"
          >
            <span class="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-white/20"></span>
            <span class="relative flex items-center gap-2">
              Get Started
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </RouterLink>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-4 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-4 opacity-0"
      >
        <div v-if="mobileMenuOpen" class="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-xl shadow-gray-200/50 pb-6 pt-4 px-4">
          <div class="flex flex-col space-y-2">
            <RouterLink to="/" class="px-4 py-3 text-base font-medium text-gray-900 rounded-xl hover:bg-gray-50">Home</RouterLink>
            <div class="h-px bg-gray-100 my-2"></div>
            <RouterLink 
              to="/auth/login" 
              class="px-4 py-3 text-base font-medium text-gray-900 rounded-xl hover:bg-gray-50"
            >
              Sign In
            </RouterLink>
            <RouterLink
              to="/auth/register"
              class="px-4 py-3 mt-2 text-base font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 text-center flex justify-center items-center gap-2"
            >
              Get Started
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </RouterLink>
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';

const mobileMenuOpen = ref(false);
</script>