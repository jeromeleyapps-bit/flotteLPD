<template>
  <v-container>
    <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center mb-6">
      <h1 class="text-h4 mb-2 mb-md-0">Gestion des véhicules</h1>
      <v-btn 
        color="primary" 
        prepend-icon="mdi-plus"
        @click="showAddDialog = true"
        v-if="authStore.isAdmin"
        :block="$vuetify.display.mobile"
        class="mt-2 mt-md-0"
      >
        Ajouter un véhicule
      </v-btn>
    </div>
    
    <!-- Filtres -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Statut"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="typeFilter"
              :items="typeOptions"
              label="Type"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchFilter"
              label="Recherche"
              prepend-icon="mdi-magnify"
              clearable
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Liste des véhicules -->
    <v-card>
      <v-card-text>
        <v-row v-if="loading">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate></v-progress-circular>
          </v-col>
        </v-row>
        
        <v-row v-else-if="filteredVehicles.length === 0">
          <v-col cols="12" class="text-center">
            <p>Aucun véhicule trouvé</p>
          </v-col>
        </v-row>
        
        <v-row v-else>
          <v-col cols="12" md="6" lg="4" v-for="vehicle in filteredVehicles" :key="vehicle.id" class="d-flex">
            <v-card class="flex-grow-1" :class="getVehicleStatusClass(vehicle.status)">
              <v-card-title class="d-flex justify-space-between align-center">
                <span>{{ vehicle.brand }} {{ vehicle.model }}</span>
                <v-chip :color="getStatusColor(vehicle.status)" size="small">
                  {{ getStatusText(vehicle.status) }}
                </v-chip>
              </v-card-title>
              <v-card-subtitle>{{ vehicle.plate_number }}</v-card-subtitle>
              <v-card-text>
                <div><strong>Type:</strong> {{ vehicle.type }}</div>
                <div><strong>Carburant:</strong> {{ vehicle.fuel_type }}</div>
                <div><strong>Année:</strong> {{ vehicle.year }}</div>
                <div><strong>Département:</strong> {{ vehicle.department_name }}</div>
              </v-card-text>
              <v-card-actions>
                <v-btn 
                  color="primary" 
                  :disabled="vehicle.status !== 'available'"
                  @click="reserveVehicle(vehicle)"
                  variant="text"
                  :size="$vuetify.display.mobile ? 'small' : 'default'"
                >
                  Réserver
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn 
                  icon="mdi-eye"
                  variant="text"
                  @click="viewVehicle(vehicle)"
                  :size="$vuetify.display.mobile ? 'small' : 'default'"
                ></v-btn>
                <v-btn 
                  icon="mdi-pencil"
                  variant="text"
                  @click="editVehicle(vehicle)"
                  v-if="authStore.isAdmin"
                  :size="$vuetify.display.mobile ? 'small' : 'default'"
                ></v-btn>
                <v-btn 
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  @click="deleteVehicle(vehicle)"
                  v-if="authStore.isAdmin"
                  :size="$vuetify.display.mobile ? 'small' : 'default'"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Dialogue d'ajout/modification -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editingVehicle ? 'Modifier' : 'Ajouter' }} un véhicule
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="vehicleForm.plate_number"
                  label="Immatriculation"
                  :rules="plateRules"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="vehicleForm.year"
                  label="Année"
                  type="number"
                  :rules="yearRules"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="vehicleForm.brand"
                  label="Marque"
                  :rules="requiredRules"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="vehicleForm.model"
                  label="Modèle"
                  :rules="requiredRules"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="vehicleForm.type"
                  :items="typeOptions"
                  label="Type"
                  :rules="requiredRules"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="vehicleForm.fuel_type"
                  :items="fuelOptions"
                  label="Carburant"
                  :rules="requiredRules"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog">Annuler</v-btn>
          <v-btn color="primary" @click="saveVehicle" :disabled="!valid">
            {{ editingVehicle ? 'Modifier' : 'Ajouter' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store'
import { useVehicleStore } from '@/stores/vehicle'

const router = useRouter()
const authStore = useAuthStore()
const vehicleStore = useVehicleStore()

const loading = ref(false)
const showAddDialog = ref(false)
const editingVehicle = ref(null)
const valid = ref(false)

// Filtres
const statusFilter = ref(null)
const typeFilter = ref(null)
const searchFilter = ref('')

// Formulaire
const vehicleForm = ref({
  plate_number: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  type: 'voiture',
  fuel_type: 'essence'
})

// Options
const statusOptions = [
  { title: 'Disponible', value: 'available' },
  { title: 'Réservé', value: 'reserved' },
  { title: 'En utilisation', value: 'in_use' },
  { title: 'En maintenance', value: 'maintenance' },
  { title: 'Hors service', value: 'out_of_service' }
]

const typeOptions = [
  { title: 'Voiture', value: 'voiture' },
  { title: 'Utilitaire', value: 'utilitaire' },
  { title: 'Moto', value: 'moto' },
  { title: 'Camion', value: 'camion' }
]

const fuelOptions = [
  { title: 'Essence', value: 'essence' },
  { title: 'Diesel', value: 'diesel' },
  { title: 'Électrique', value: 'électrique' },
  { title: 'Hybride', value: 'hybride' }
]

// Rules
const requiredRules = [v => !!v || 'Ce champ est requis']
const plateRules = [
  v => !!v || 'L\'immatriculation est requise',
  v => /^[A-Z]{2}-\d{3}-[A-Z]{2}$/.test(v) || 'Format invalide (ex: AB-123-CD)'
]
const yearRules = [
  v => !!v || 'L\'année est requise',
  v => (v >= 1900 && v <= new Date().getFullYear() + 1) || 'Année invalide'
]

// Computed
const filteredVehicles = computed(() => {
  let filtered = vehicleStore.vehicles

  if (statusFilter.value) {
    filtered = filtered.filter(v => v.status === statusFilter.value)
  }

  if (typeFilter.value) {
    filtered = filtered.filter(v => v.type === typeFilter.value)
  }

  if (searchFilter.value) {
    const search = searchFilter.value.toLowerCase()
    filtered = filtered.filter(v => 
      v.brand.toLowerCase().includes(search) ||
      v.model.toLowerCase().includes(search) ||
      v.plate_number.toLowerCase().includes(search)
    )
  }

  return filtered
})

// Methods
function getStatusColor(status) {
  const colors = {
    available: 'success',
    reserved: 'warning',
    in_use: 'info',
    maintenance: 'error',
    out_of_service: 'grey'
  }
  return colors[status] || 'grey'
}

function getStatusText(status) {
  const texts = {
    available: 'Disponible',
    reserved: 'Réservé',
    in_use: 'En utilisation',
    maintenance: 'En maintenance',
    out_of_service: 'Hors service'
  }
  return texts[status] || status
}

function getVehicleStatusClass(status) {
  return `vehicle-${status}`
}

function reserveVehicle(vehicle) {
  router.push(`/reservations/create?vehicle=${vehicle.id}`)
}

function viewVehicle(vehicle) {
  router.push(`/vehicles/${vehicle.id}`)
}

function editVehicle(vehicle) {
  editingVehicle.value = vehicle
  vehicleForm.value = { ...vehicle }
  showAddDialog.value = true
}

function deleteVehicle(vehicle) {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le véhicule ${vehicle.plate_number} ?`)) {
    vehicleStore.deleteVehicle(vehicle.id)
  }
}

async function saveVehicle() {
  try {
    if (editingVehicle.value) {
      await vehicleStore.updateVehicle(editingVehicle.value.id, vehicleForm.value)
    } else {
      await vehicleStore.addVehicle({
        ...vehicleForm.value,
        department_id: authStore.user.department_id
      })
    }
    closeDialog()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

function closeDialog() {
  showAddDialog.value = false
  editingVehicle.value = null
  vehicleForm.value = {
    plate_number: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'voiture',
    fuel_type: 'essence'
  }
}

onMounted(async () => {
  await vehicleStore.loadVehicles(authStore.user.department_id)
})
</script>

<style scoped>
.vehicle-available {
  border-left: 4px solid #4caf50;
}

.vehicle-reserved {
  border-left: 4px solid #ff9800;
}

.vehicle-in_use {
  border-left: 4px solid #2196f3;
}

.vehicle-maintenance {
  border-left: 4px solid #f44336;
}

.vehicle-out_of_service {
  border-left: 4px solid #9e9e9e;
}
</style>
