<!-- components/Footer.vue -->
<template>
  <footer class="border-t border-gray-200 bg-white mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
        <!-- Brand -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="text-sm text-gray-600">© 2026 ArticleHub. All rights reserved.</span>
        </div>

        <!-- Links -->
        <div class="flex items-center gap-6 text-sm">
          <a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">About</a>
          <a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">Privacy</a>
          <a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">Terms</a>
          <a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
        </div>
      </div>
    </div>
  </footer>
</template>