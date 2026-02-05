import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

import AppLayout from '@/layout/AppLayout.vue'
import AuthLayout from '@/layout/AuthLayout.vue'

const routes = [
  // ===== AUTH (NO NAVBAR) =====
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: () => import('@/views/Login.vue'),
        meta: { guestOnly: true },
      },
      {
        path: 'register',
        component: () => import('@/views/Register.vue'),
        meta: { guestOnly: true },
      },
    ],
  },

  // ===== PUBLIC / USER =====
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        component: () => import('@/views/ArticleList.vue'),
      },
      {
        path: 'articles/:id',
        component: () => import('@/views/ArticleDetail.vue'),
      },
      {
        path: 'profile',
        component: () => import('@/views/Profile.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'write',
        component: () => import('@/views/user/Write.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'my-articles',
        component: () => import('@/views/user/MyArticles.vue'),
        meta: { requiresAuth: true },
      }
    ],
  },

  // ===== ADMIN (ROOT SENDIRI) =====
  {
    path: '/admin',
    component: () => import('@/layout/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      { path: '', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'articles', component: () => import('@/views/admin/Articles.vue') },
      { path: 'users', component: () => import('@/views/admin/Users.vue') },
    ],
  },

  { path: '/:catchAll(.*)', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ===== GLOBAL GUARD =====
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.initAuth()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/auth/login'
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return '/'
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return '/'
  }
})

export default router
