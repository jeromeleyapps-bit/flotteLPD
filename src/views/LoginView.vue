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
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Mot de passe"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>

              <v-alert v-if="error" type="error" class="mb-4">
                {{ error }}
              </v-alert>

              <v-btn
                color="primary"
                type="submit"
                :loading="isLoading"
                block
                class="mb-4"
              >
                Se connecter
              </v-btn>

              <div class="text-center">
                <router-link to="/register">Créer un compte</router-link>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store'

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

async function handleLogin() {
  try {
    isLoading.value = true
    error.value = ''
    const { error: loginError } = await authStore.signIn(email.value, password.value)
    
    if (loginError) {
      error.value = 'Identifiants incorrects'
      return
    }
    
    // Redirection après connexion réussie
    router.push('/dashboard')
  } catch (err) {
    error.value = 'Une erreur est survenue lors de la connexion'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>