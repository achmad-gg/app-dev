import { defineStore } from 'pinia'
import { fetchCategoriesApi } from '@/api/category.api'

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
  },
})
