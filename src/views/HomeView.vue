<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-6">
          <v-card-title class="text-h4 text-center mb-6">
            Bienvenue sur Flotte LPD
          </v-card-title>
          
          <v-card-text>
            <!-- Contenu de la page d'accueil -->
            <v-btn
              v-if="!isAuthenticated"
              color="primary"
              size="large"
              to="/login"
              block
              class="mb-4"
            >
              Se connecter
            </v-btn>
            
            <v-btn
              v-else
              color="primary"
              size="large"
              to="/vehicles"
              block
            >
              Voir les véhicules
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/store'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>