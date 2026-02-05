import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import api from './api/axios'
import './main.css' 

createApp(App).use(createPinia()).use(router).mount('#app')

const token = localStorage.getItem('token')
if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}
