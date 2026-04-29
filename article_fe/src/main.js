import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import api from './api/axios'
import '@/main.css' 

// Set token BEFORE mounting so initial API calls have auth
const token = localStorage.getItem('token')
if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

createApp(App).use(createPinia()).use(router).mount('#app')

