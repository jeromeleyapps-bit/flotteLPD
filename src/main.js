import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useAuthStore } from './store'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

// Vérifier l'authentification avant le montage
const authStore = useAuthStore()
authStore.checkAuth().finally(() => {
  app.mount('#app')
})