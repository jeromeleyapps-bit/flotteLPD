<template>
  <v-app>
    <!-- Barre de navigation -->
    <v-app-bar app color="primary" dark v-if="isAuthenticated">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Gestion de flotte</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Menu latéral -->
    <v-navigation-drawer v-model="drawer" app v-if="isAuthenticated">
      <v-list dense>
        <v-list-item link to="/">
          <v-list-item-icon>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Tableau de bord</v-list-item-title>
        </v-list-item>
        
        <v-list-item link to="/trips">
          <v-list-item-icon>
            <v-icon>mdi-play-stop</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Trajets</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Contenu principal -->
    <v-main>
      <v-container fluid class="pa-4">
        <router-view></router-view>
      </v-container>
    </v-main>

    <!-- Pied de page -->
    <v-footer app color="primary" dark>
      <v-spacer></v-spacer>
      <div>Gestion de flotte &copy; {{ new Date().getFullYear() }} - Les Petits Débrouillards</div>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './store'

const router = useRouter()
const authStore = useAuthStore()

// État du menu latéral
const drawer = ref(true)

// Vérifier si l'utilisateur est authentifié
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Déconnexion
async function logout() {
  const { error } = await authStore.signOut()
  if (!error) {
    router.push('/login')
  } else {
    console.error('Erreur lors de la déconnexion:', error)
  }
}
</script>

<style>
.v-application {
  font-family: 'Roboto', sans-serif;
}

.v-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
}

.v-btn {
  text-transform: none;
  letter-spacing: normal;
}
</style>
