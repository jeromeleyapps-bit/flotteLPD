<template>
  <v-app>
    <AppBar
      v-if="isAuthenticated"
      @toggle-drawer="drawer = !drawer"
    />

    <v-navigation-drawer
      v-if="isAuthenticated"
      v-model="drawer"
      app
      :temporary="$vuetify.display.mobile"
      :permanent="!$vuetify.display.mobile"
    >
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.to"
          :title="item.label"
          :prepend-icon="item.icon"
          :value="item.to"
          :active="currentRoute === item.to"
          @click="navigate(item.to)"
          class="mobile-nav-item"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <AppFooter v-if="isAuthenticated" />
  </v-app>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store'
import AppBar from '@/components/layout/AppBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const drawer = ref(false)

const navigationItems = [
  { label: 'Tableau de bord', icon: 'mdi-view-dashboard', to: 'dashboard' },
  { label: 'Prévention sécurité', icon: 'mdi-shield-alert', to: 'safety' },
  { label: 'Véhicules', icon: 'mdi-car', to: 'vehicles' },
  { label: 'Réservations', icon: 'mdi-calendar-clock', to: 'reservations' },
  { label: 'Trajets', icon: 'mdi-steering', to: 'trips' }
]

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentRoute = computed(() => route.name)

function navigate(name) {
  drawer.value = false
  if (route.name !== name) {
    router.push({ name })
  }
}

// Initialiser l'application au chargement
onMounted(async () => {
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
  
  // En mode dev, initialiser seulement l'auth (sans Supabase)
  if (DEV_MODE) {
    await authStore.checkAuth(); // Crée l'utilisateur fictif
  } else {
    await authStore.initializeApp();
    await authStore.checkAuth();
  }
});
</script>