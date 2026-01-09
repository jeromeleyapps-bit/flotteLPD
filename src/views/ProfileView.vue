<template>
  <v-container>
    <v-card>
      <v-card-title>Mon Profil</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="updateProfile">
          <v-text-field
            v-model="formData.full_name"
            label="Nom complet"
            required
          ></v-text-field>
          
          <v-text-field
            v-model="formData.email"
            label="Email"
            type="email"
            disabled
          ></v-text-field>
          
          <v-select
            v-model="formData.department_id"
            :items="departments"
            item-title="name"
            item-value="id"
            label="Département"
            required
          ></v-select>
          
          <v-btn 
            type="submit" 
            color="primary"
            :loading="loading"
          >
            Mettre à jour
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)

const formData = ref({
  full_name: '',
  email: '',
  department_id: null
})

const departments = ref([
  { id: 1, name: 'Alpes-de-Haute-Provence (04)' },
  { id: 2, name: 'Hautes-Alpes (05)' },
  { id: 3, name: 'Alpes-Maritimes (06)' },
  { id: 4, name: 'Bouches-du-Rhône (13)' },
  { id: 5, name: 'Var (83)' },
  { id: 6, name: 'Vaucluse (84)' }
])

onMounted(() => {
  if (authStore.userProfile) {
    formData.value = {
      full_name: authStore.userProfile.full_name || '',
      email: authStore.user?.email || '',
      department_id: authStore.userProfile.department_id || null
    }
  }
})

async function updateProfile() {
  try {
    loading.value = true
    const { error } = await authStore.updateProfile(formData.value)
    
    if (error) throw new Error(error)
    
    // Afficher un message de succès
    // Vous pouvez utiliser un système de notification ici
    console.log('Profil mis à jour avec succès')
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    // Afficher un message d'erreur à l'utilisateur
  } finally {
    loading.value = false
  }
}
</script>
