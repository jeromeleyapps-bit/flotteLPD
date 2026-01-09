<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title class="text-center">Sélectionnez votre département</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="selectDepartment">
              <v-select
                v-model="selectedDepartment"
                :items="departments"
                item-title="name"
                item-value="id"
                label="Département"
                :rules="[v => !!v || 'Veuillez sélectionner un département']"
                required
              ></v-select>
              
              <v-btn 
                color="primary" 
                block
                class="mt-4"
                :loading="loading"
                @click="selectDepartment"
              >
                Continuer
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store'
import { supabase } from '@/config/supabase'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)
const selectedDepartment = ref(null)
const departments = ref([])

// Charger les départements
async function loadDepartments() {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Éviter les doublons en utilisant un Set basé sur l'ID
    const uniqueDepartments = new Map();
    data.forEach(dept => {
      if (!uniqueDepartments.has(dept.id)) {
        uniqueDepartments.set(dept.id, {
          id: dept.id,
          name: `${dept.name} (${dept.code})`
        });
      }
    });
    
    departments.value = Array.from(uniqueDepartments.values());
  } catch (error) {
    console.error('Erreur lors du chargement des départements:', error);
  }
}

async function selectDepartment() {
  console.log('selectDepartment appelée');
  console.log('selectedDepartment.value:', selectedDepartment.value);
  
  if (!selectedDepartment.value) {
    console.log('Aucun département sélectionné');
    return;
  }
  
  try {
    console.log('Début de la mise à jour du département:', selectedDepartment.value);
    loading.value = true;
    
    const result = await authStore.updateDepartment(selectedDepartment.value);
    console.log('Résultat updateDepartment:', result);
    
    // Rediriger vers la page des véhicules
    console.log('Redirection vers /vehicles');
    router.push('/vehicles');
  } catch (error) {
    console.error('Erreur lors de la sélection du département:', error);
    alert('Erreur lors de la mise à jour du département: ' + error.message);
  } finally {
    loading.value = false;
  }
}

// Charger les départements au montage du composant
onMounted(() => {
  loadDepartments();
  
  // Si l'utilisateur a déjà un département, le présélectionner
  if (authStore.user?.department_id) {
    selectedDepartment.value = authStore.user.department_id;
  }
});
</script>