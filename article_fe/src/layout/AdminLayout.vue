<script setup>
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
</script>

<template>
  <div class="">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Content -->
    <main class="ml-64 min-h-screen bg-gray-100">
      <router-view />
    </main>
  </div>
</template>
