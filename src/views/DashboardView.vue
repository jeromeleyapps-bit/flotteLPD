<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Tableau de bord</h1>
      </v-col>
    </v-row>

    <!-- Cartes de statistiques -->
    <v-row class="mb-6">
      <v-col cols="12" md="4" v-for="(stat, i) in stats" :key="i">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-avatar :color="stat.color" class="mr-4" size="56">
              <v-icon dark>{{ stat.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-2">{{ stat.title }}</div>
              <div class="text-h4">{{ stat.value }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Liste des véhicules -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center">
            <span class="mb-2 mb-sm-0">Véhicules disponibles</span>
            <v-btn 
              color="primary" 
              @click="openAddVehicleDialog"
              :block="$vuetify.display.mobile"
              size="small"
            >
              <v-icon left>mdi-plus</v-icon>
              Ajouter un véhicule
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list v-if="vehicles.length > 0">
              <v-list-item
                v-for="vehicle in vehicles"
                :key="vehicle.id"
                class="mb-2"
              >
                <v-list-item-avatar>
                  <v-icon :color="getStatusColor(vehicle.status)">
                    mdi-car
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ vehicle.nom }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ vehicle.immatriculation }} - {{ vehicle.kilometrage_actuel }} km
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip :color="getStatusColor(vehicle.status)" dark small>
                    {{ formatStatus(vehicle.status) }}
                  </v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div v-else class="text-center py-4 text--secondary">
              Aucun véhicule disponible
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Prochains rendez-vous de maintenance -->
    <v-row class="mt-6">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Prochaines maintenances</v-card-title>
          <v-card-text>
            <v-list v-if="upcomingMaintenance.length > 0">
              <v-list-item
                v-for="(item, i) in upcomingMaintenance"
                :key="i"
                class="mb-2"
              >
                <v-list-item-avatar>
                  <v-icon :color="getMaintenanceColor(item.type)">
                    {{ getMaintenanceIcon(item.type) }}
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ item.vehicle_name }} - {{ formatMaintenanceType(item.type) }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDate(item.date_prevue) }}
                    <v-chip x-small class="ml-2" :color="getUrgencyColor(item.date_prevue)">
                      {{ getDaysRemaining(item.date_prevue) }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <div v-else class="text-center py-4 text--secondary">
              Aucune maintenance prévue
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Derniers trajets -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Derniers trajets</v-card-title>
          <v-card-text>
            <v-timeline dense>
              <v-timeline-item
                v-for="(trip, i) in recentTrips"
                :key="i"
                small
                color="primary"
              >
                <div class="d-flex justify-space-between">
                  <div>
                    <strong>{{ trip.vehicle_name }}</strong>
                    <div class="text-caption">
                      {{ formatDate(trip.date_heure_depart) }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div>{{ trip.conducteur_nom }}</div>
                    <div class="text-caption">
                      {{ trip.km_retour - trip.km_depart }} km
                    </div>
                  </div>
                </div>
              </v-timeline-item>
            </v-timeline>
            <div v-if="recentTrips.length === 0" class="text-center py-4 text--secondary">
              Aucun trajet récent
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/config/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const router = useRouter()
const isLoading = ref(false)

// Données de démonstration - À remplacer par des appels API
const stats = ref([
  { title: 'Véhicules disponibles', value: '2/3', icon: 'mdi-car', color: 'green' },
  { title: 'Trajets ce mois-ci', value: '12', icon: 'mdi-map-marker-path', color: 'blue' },
  { title: 'Alertes', value: '1', icon: 'mdi-alert', color: 'orange' },
])

const vehicles = ref([
  { id: 1, nom: 'Dokker Blanc', immatriculation: 'AA-123-AA', kilometrage_actuel: 45678, status: 'disponible' },
  { id: 2, nom: 'Logan Gris', immatriculation: 'BB-456-BB', kilometrage_actuel: 32150, status: 'disponible' },
  { id: 3, nom: 'Transit Blanc', immatriculation: 'CC-789-CC', kilometrage_actuel: 78900, status: 'maintenance' },
])

const vehicleHeaders = [
  { title: 'Nom', value: 'nom' },
  { title: 'Immatriculation', value: 'immatriculation' },
  { title: 'Kilométrage', value: 'kilometrage_actuel' },
  { title: 'Statut', value: 'status' },
  { title: 'Actions', value: 'actions', sortable: false },
]

const upcomingMaintenance = ref([
  { id: 1, vehicle_id: 1, vehicle_name: 'Dokker Blanc', type: 'vidange', date_prevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  { id: 2, vehicle_id: 3, vehicle_name: 'Transit Blanc', type: 'controle_technique', date_prevue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
])

const recentTrips = ref([
  { id: 1, vehicle_id: 1, vehicle_name: 'Dokker Blanc', conducteur_nom: 'Pierre Bernard', date_heure_depart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), km_depart: 45500, km_retour: 45620 },
  { id: 2, vehicle_id: 2, vehicle_name: 'Logan Gris', conducteur_nom: 'Marie Petit', date_heure_depart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), km_depart: 32000, km_retour: 32150 },
])

// Fonctions utilitaires
function formatDate(date) {
  return format(new Date(date), 'PPP', { locale: fr })
}

function formatStatus(status) {
  const statusMap = {
    disponible: 'Disponible',
    reserve: 'Réservé',
    maintenance: 'Maintenance'
  }
  return statusMap[status] || status
}

function getStatusColor(status) {
  const colors = {
    disponible: 'green',
    reserve: 'orange',
    maintenance: 'red'
  }
  return colors[status] || 'grey'
}

function formatMaintenanceType(type) {
  const types = {
    controle_technique: 'Contrôle technique',
    vidange: 'Vidange',
    pneus: 'Changement pneus',
    reparation: 'Réparation',
    autre: 'Autre'
  }
  return types[type] || type
}

function getMaintenanceIcon(type) {
  const icons = {
    controle_technique: 'mdi-car-wrench',
    vidange: 'mdi-oil',
    pneus: 'mdi-car-tire-alert',
    reparation: 'mdi-wrench',
    autre: 'mdi-tools'
  }
  return icons[type] || 'mdi-alert-circle'
}

function getMaintenanceColor(type) {
  const colors = {
    controle_technique: 'red',
    vidange: 'blue',
    pneus: 'orange',
    reparation: 'purple',
    autre: 'grey'
  }
  return colors[type] || 'grey'
}

function getDaysRemaining(date) {
  const today = new Date()
  const targetDate = new Date(date)
  const diffTime = targetDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'En retard !'
  if (diffDays === 0) return 'Aujourd\'hui'
  if (diffDays === 1) return 'Demain'
  return `Dans ${diffDays} jours`
}

function getUrgencyColor(date) {
  const today = new Date()
  const targetDate = new Date(date)
  const diffTime = targetDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'red'
  if (diffDays <= 7) return 'orange'
  return 'green'
}

// Navigation
function viewVehicle(vehicle) {
  router.push(`/vehicles/${vehicle.id}`)
}

function editVehicle(vehicle) {
  router.push(`/vehicles/${vehicle.id}/edit`)
}

function openAddVehicleDialog() {
  // Implémenter l'ouverture d'un dialogue d'ajout
  console.log('Ouvrir le dialogue d\'ajout de véhicule')
}

// Chargement des données
onMounted(async () => {
  isLoading.value = true
  try {
    // Charger les véhicules depuis Supabase
    const { data: vehiclesData, error: vehiclesError } = await db.getVehicles()
    if (!vehiclesError) {
      vehicles.value = vehiclesData
      
      // Mettre à jour les statistiques
      const availableVehicles = vehiclesData.filter(v => v.status === 'disponible').length
      stats.value[0].value = `${availableVehicles}/${vehiclesData.length}`
    }
    
    // Charger les maintenances à venir
    const { data: maintenanceData, error: maintenanceError } = await db.getMaintenances()
    if (!maintenanceError) {
      upcomingMaintenance.value = maintenanceData
        .filter(m => new Date(m.date_prevue) >= new Date())
        .slice(0, 5)
    }
    
    // Charger les derniers trajets
    const { data: tripsData, error: tripsError } = await db.getTrips()
    if (!tripsError) {
      recentTrips.value = tripsData.slice(0, 5)
      
      // Mettre à jour les statistiques des trajets
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthTrips = tripsData.filter(trip => {
        const tripDate = new Date(trip.date_heure_depart)
        return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear
      })
      stats.value[1].value = monthTrips.length
    }
    
  } catch (err) {
    console.error('Erreur lors du chargement des données:', err)
    if (window.showSnackbar) {
      window.showSnackbar('Erreur lors du chargement des données', 'error')
    }
  } finally {
    isLoading.value = false
  }
})
</script>
