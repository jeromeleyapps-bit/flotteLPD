<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Créer un compte</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="mdi-email"
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

              <v-text-field
                v-model="confirmPassword"
                label="Confirmer le mot de passe"
                name="confirmPassword"
                prepend-icon="mdi-lock-check"
                type="password"
                required
                :rules="[() => password === confirmPassword || 'Les mots de passe ne correspondent pas']"
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
                S'inscrire
              </v-btn>

              <div class="text-center">
                <router-link to="/login">Déjà un compte ? Se connecter</router-link>
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
const confirmPassword = ref('')
const error = ref('')
const isLoading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    const { error: registerError } = await authStore.signUp(email.value, password.value)
    
    if (registerError) {
      error.value = registerError.message || "Erreur lors de l'inscription"
      return
    }
    
    // Redirection après inscription réussie
    router.push('/login')
  } catch (err) {
    error.value = "Une erreur est survenue lors de l'inscription"
    console.error('Register error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>