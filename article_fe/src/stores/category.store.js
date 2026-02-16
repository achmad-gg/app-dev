import { defineStore } from 'pinia'
import {
  fetchCategoriesApi,
  createCategoryApi,
  deleteCategoryApi,
  updateCategoryApi,
} from '@/api/category.api'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
  }),

  actions: {
    async fetchCategories() {
      if (this.categories.length) return

      this.loading = true
      try {
        const res = await fetchCategoriesApi()
        this.categories = res.data || []
      } finally {
        this.loading = false
      }
    },
    async createCategory(name) {
      const res = await createCategoryApi({ name })
      this.categories.push(res.data.category)
    },
    async updateCategory(id, name) {
      const res = await updateCategoryApi(id, { name })
      const idx = this.categories.findIndex((c) => c.id === id)
      if (idx !== -1) this.categories[idx] = res.data.category
    },

    async deleteCategory(id) {
      await deleteCategoryApi(id)
      this.categories = this.categories.filter((c) => c.id !== id)
    },
  },
})
