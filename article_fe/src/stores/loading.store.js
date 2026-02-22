import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const routeLoading = ref(false)
  const apiPendingCount = ref(0)

  const isLoading = computed(() => routeLoading.value || apiPendingCount.value > 0)

  function startRoute() {
    routeLoading.value = true
  }

  function endRoute() {
    routeLoading.value = false
  }

  function startApi() {
    apiPendingCount.value++
  }

  function endApi() {
    if (apiPendingCount.value > 0) {
      apiPendingCount.value--
    }
  }

  return { routeLoading, apiPendingCount, isLoading, startRoute, endRoute, startApi, endApi }
})
