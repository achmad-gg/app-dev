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
        component: () => import('@/views/auth/Login.vue'),
        meta: { guestOnly: true },
      },
      {
        path: 'register',
        component: () => import('@/views/auth/Register.vue'),
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
        component: () => import('@/views/public/ArticleList.vue'),
      },
      {
        path: 'articles/:id',
        component: () => import('@/views/public/ArticleDetail.vue'),
      },
      {
        path: 'profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'write',
        component: () => import('@/views/user/Write.vue'),
        meta: { requiresAuth: true, requiresActive: true },
      },
      {
        path: 'write/:id',
        component: () => import('@/views/user/Write.vue'),
        meta: { requiresAuth: true, requiresActive: true },
      },
      {
        path: 'my-articles',
        component: () => import('@/views/user/MyArticles.vue'),
        meta: { requiresAuth: true },
      },
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
      {
        path: 'profile',
        component: () => import('@/views/admin/Profile.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'articles/detail/:id',
        component: () => import('@/views/admin/ArticleDetail.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'categories',
        component: () => import('@/views/admin/Category.vue'),
      },
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
  // Start loading spinner on navigation
  const { useLoadingStore } = await import('@/stores/loading.store')
  const loadingStore = useLoadingStore()
  loadingStore.startRoute()

  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.initAuth()
  }

  // ===== REQUIRE LOGIN =====
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/auth/login'
  }

  // ===== GUEST ONLY =====
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return '/'
  }

  // ===== ROLE CHECK =====
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return '/'
  }

  // ===== ACTIVE ACCOUNT CHECK =====
  if (to.meta.requiresActive) {
    if (auth.user?.status !== 'active') {
      return '/profile'
    }
  }
})

router.afterEach(() => {
  import('@/stores/loading.store').then(({ useLoadingStore }) => {
    const loadingStore = useLoadingStore()
    loadingStore.endRoute()
  })
})

export default router
