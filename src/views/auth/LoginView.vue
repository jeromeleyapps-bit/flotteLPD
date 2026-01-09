<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Connexion</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="mdi-account"
                type="email"
                required
                :error-messages="errors.email"
              ></v-text-field>
              
              <v-text-field
                v-model="password"
                label="Mot de passe"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                required
                :error-messages="errors.password"
              ></v-text-field>
              
              <v-alert
                v-if="authError"
                type="error"
                class="mb-4"
              >
                {{ authError }}
              </v-alert>
              
              <div class="text-center">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                  block
                >
                  Se connecter
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="justify-center">
            <router-link to="/register">
              Pas encore de compte ? S'inscrire
            </router-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const authError = ref('')
const errors = ref({})

async function handleLogin() {
  loading.value = true
  authError.value = ''
  errors.value = {}

  try {
    const { error } = await authStore.signIn(email.value, password.value)
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        authError.value = 'Identifiants invalides'
      } else if (error.message.includes('Email not confirmed')) {
        authError.value = 'Veuvez confirmer votre email avant de vous connecter'
      } else {
        authError.value = error.message
      }
      return
    }

    // Redirection après connexion réussie
    router.push('/vehicles')
  } catch (err) {
    console.error('Erreur de connexion:', err)
    authError.value = 'Une erreur est survenue lors de la connexion'
  } finally {
    loading.value = false
  }
}
</script>