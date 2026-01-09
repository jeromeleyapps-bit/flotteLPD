<template>
  <v-app-bar app color="primary" dark>
    <v-app-bar-nav-icon @click="$emit('toggle-drawer')"></v-app-bar-nav-icon>
    <v-toolbar-title>Flotte LPD</v-toolbar-title>
    <v-spacer></v-spacer>
    
    <v-menu v-if="isAuthenticated">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-avatar size="36">
            <v-icon>mdi-account</v-icon>
          </v-avatar>
        </v-btn>
      </template>
      <v-list>
        <v-list-item>
          <v-list-item-title>{{ userProfile?.full_name || user?.email }}</v-list-item-title>
          <v-list-item-subtitle v-if="userProfile?.department_name">
            {{ userProfile.department_name }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="goToProfile">
          <template v-slot:prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title>Mon profil</v-list-item-title>
        </v-list-item>
        <v-list-item @click="signOut">
          <template v-slot:prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Déconnexion</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store'

defineEmits(['toggle-drawer'])

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const userProfile = computed(() => authStore.userProfile)
const isAuthenticated = computed(() => authStore.isAuthenticated)

function goToProfile() {
  router.push('/profile')
}

async function signOut() {
  await authStore.signOut()
  router.push('/login')
}
</script>