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
                v-model="formData.fullName"
                label="Nom complet"
                prepend-icon="mdi-account"
                required
                :error-messages="errors.fullName"
              ></v-text-field>
              
              <v-text-field
                v-model="formData.email"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
                :error-messages="errors.email"
              ></v-text-field>
              
              <v-text-field
                v-model="formData.password"
                label="Mot de passe"
                prepend-icon="mdi-lock"
                type="password"
                required
                :error-messages="errors.password"
              ></v-text-field>
              
              <v-text-field
                v-model="formData.confirmPassword"
                label="Confirmer le mot de passe"
                prepend-icon="mdi-lock-check"
                type="password"
                required
                :error-messages="errors.confirmPassword"
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
                  S'inscrire
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="justify-center">
            <router-link to="/login">
              Déjà un compte ? Se connecter
            </router-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const authError = ref('')
const errors = ref({})

const isFormValid = computed(() => {
  return (
    formData.value.fullName.trim() !== '' &&
    formData.value.email.trim() !== '' &&
    formData.value.password.length >= 6 &&
    formData.value.password === formData.value.confirmPassword
  )
})

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email).toLowerCase())
}

async function handleRegister() {
  // Réinitialiser les erreurs
  errors.value = {}
  authError.value = ''
  
  // Validation
  if (!formData.value.fullName.trim()) {
    errors.value.fullName = 'Le nom est requis'
    return
  }

  if (!formData.value.email.trim()) {
    errors.value.email = 'L\'email est requis'
    return
  }

  if (!validateEmail(formData.value.email)) {
    errors.value.email = 'Veuillez entrer un email valide'
    return
  }

  if (!formData.value.password) {
    errors.value.password = 'Le mot de passe est requis'
    return
  }

  if (formData.value.password.length < 6) {
    errors.value.password = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
    return
  }

  loading.value = true
  authError.value = ''

  try {
    const { error } = await authStore.signUp(
      formData.value.email.trim().toLowerCase(),
      formData.value.password,
      {
        fullName: formData.value.fullName.trim(),
        departmentId: null // Ajoutez la gestion du département si nécessaire
      }
    )
    
    if (error) throw error

    // Rediriger vers la page de connexion avec un message
    await router.push({
      path: '/login',
      query: { registered: 'true' }
    })
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err)
    
    // Gestion des erreurs spécifiques
    if (err.message.includes('already registered')) {
      authError.value = 'Un compte avec cet email existe déjà. Veuillez vous connecter.'
    } else if (err.message.includes('weak password')) {
      authError.value = 'Le mot de passe est trop faible. Utilisez au moins 6 caractères.'
    } else if (err.message.includes('email')) {
      authError.value = 'Veuillez entrer une adresse email valide.'
    } else {
      authError.value = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.'
    }
  } finally {
    loading.value = false
  }
}
</script>