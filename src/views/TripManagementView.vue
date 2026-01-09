<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Gestion des trajets</h1>
      </v-col>
    </v-row>

    <!-- Section Check-in (Démarrer un trajet) -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="success" class="mr-2">mdi-play-circle</v-icon>
            Démarrer un trajet
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="startTrip" ref="checkInForm">
              <v-select
                v-model="newTrip.vehicleId"
                :items="availableVehicles"
                item-title="display_name"
                item-value="id"
                label="Véhicule"
                :rules="[v => !!v || 'Veuillez sélectionner un véhicule']"
                required
              ></v-select>

              <v-text-field
                v-model.number="newTrip.kmDepart"
                type="number"
                label="Kilométrage au départ"
                :rules="[v => v > 0 || 'Le kilométrage doit être positif']"
                required
              ></v-text-field>

              <v-select
                v-model="newTrip.carburantDepart"
                :items="carburantLevels"
                item-title="text"
                item-value="value"
                label="Niveau de carburant"
                required
              ></v-select>

              <v-select
                v-model="newTrip.propreteDepart"
                :items="propreteLevels"
                item-title="text"
                item-value="value"
                label="Propreté du véhicule"
                required
              ></v-select>

              <v-textarea
                v-model="newTrip.commentaires"
                label="Commentaires (optionnel)"
                rows="3"
              ></v-textarea>

              <v-btn
                color="success"
                type="submit"
                :loading="isLoading"
                block
                :size="$vuetify.display.mobile ? 'default' : 'large'"
              >
                <v-icon left>mdi-play</v-icon>
                Démarrer le trajet
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Section Check-out (Terminer un trajet) -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="warning" class="mr-2">mdi-stop-circle</v-icon>
            Terminer un trajet
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="endTrip" ref="checkOutForm">
              <v-select
                v-model="activeTrip.id"
                :items="activeTrips"
                item-title="display_name"
                item-value="id"
                label="Trajet en cours"
                :rules="[v => !!v || 'Veuillez sélectionner un trajet']"
                required
              ></v-select>

              <v-text-field
                v-model.number="activeTrip.kmRetour"
                type="number"
                label="Kilométrage au retour"
                :rules="[v => v > 0 || 'Le kilométrage doit être positif']"
                required
              ></v-text-field>

              <v-select
                v-model="activeTrip.carburantRetour"
                :items="carburantLevels"
                item-title="text"
                item-value="value"
                label="Niveau de carburant"
                required
              ></v-select>

              <v-select
                v-model="activeTrip.propreteRetour"
                :items="propreteLevels"
                item-title="text"
                item-value="value"
                label="Propreté du véhicule"
                required
              ></v-select>

              <v-textarea
                v-model="activeTrip.incidents"
                label="Incidents ou remarques"
                rows="3"
              ></v-textarea>

              <v-btn
                color="warning"
                type="submit"
                :loading="isLoading"
                block
                :size="$vuetify.display.mobile ? 'default' : 'large'"
              >
                <v-icon left>mdi-stop</v-icon>
                Terminer le trajet
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Liste des trajets récents -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Trajets récents</span>
            <v-btn color="primary" @click="refreshTrips">
              <v-icon left>mdi-refresh</v-icon>
              Actualiser
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list v-if="trips.length > 0">
              <v-list-item
                v-for="trip in trips"
                :key="trip.id"
                class="mb-2"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ trip.vehicle_nom }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDate(trip.date_heure_depart) }} - 
                    {{ trip.km_retour - trip.km_depart }} km
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip :color="getTripStatusColor(trip.status)" dark small>
                    {{ formatTripStatus(trip.status) }}
                  </v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div v-else class="text-center py-4 text--secondary">
              Aucun trajet enregistré
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/config/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const router = useRouter()
const isLoading = ref(false)
const checkInForm = ref(null)
const checkOutForm = ref(null)

// Données du formulaire de démarrage de trajet
const newTrip = ref({
  vehicleId: null,
  kmDepart: null,
  carburantDepart: 3,
  propreteDepart: 'OK',
  commentaires: ''
})

// Données du formulaire de fin de trajet
const activeTrip = ref({
  id: null,
  kmRetour: null,
  carburantRetour: 3,
  propreteRetour: 'OK',
  incidents: ''
})

// Options pour les formulaires
const carburantLevels = [
  { text: '1/5 (Presque vide)', value: 1 },
  { text: '2/5 (Un peu)', value: 2 },
  { text: '3/5 (Moitié)', value: 3 },
  { text: '4/5 (Presque plein)', value: 4 },
  { text: '5/5 (Plein)', value: 5 }
]

const propreteLevels = [
  { text: 'OK', value: 'OK' },
  { text: 'À nettoyer', value: 'à nettoyer' },
  { text: 'Sale', value: 'sale' }
]

// Données chargées depuis Supabase
const vehicles = ref([])
const trips = ref([])

// Véhicules disponibles pour le check-in
const availableVehicles = computed(() => {
  return vehicles.value
    .filter(v => v.statut === 'disponible')
    .map(v => ({
      ...v,
      display_name: `${v.nom} (${v.immatriculation}) - ${v.kilometrage_actuel} km`
    }))
})

// Trajets actifs pour le check-out
const activeTrips = computed(() => {
  return trips.value
    .filter(t => t.status === 'en_cours')
    .map(t => ({
      ...t,
      display_name: `${t.vehicle_nom} - Démarré le ${formatDate(t.date_heure_depart)}`
    }))
})

// En-têtes du tableau des trajets
const tripHeaders = [
  { title: 'Véhicule', value: 'vehicle_nom' },
  { title: 'Départ', value: 'date_heure_depart' },
  { title: 'Distance', value: 'distance' },
  { title: 'Statut', value: 'status' },
  { title: 'Actions', value: 'actions', sortable: false }
]

// Fonctions utilitaires
function formatDate(date) {
  return format(new Date(date), 'PPPpp', { locale: fr })
}

function formatTripStatus(status) {
  const statusMap = {
    en_cours: 'En cours',
    termine: 'Terminé',
    annule: 'Annulé'
  }
  return statusMap[status] || status
}

function getTripStatusColor(status) {
  const colors = {
    en_cours: 'blue',
    termine: 'green',
    annule: 'red'
  }
  return colors[status] || 'grey'
}

// Démarrer un nouveau trajet
async function startTrip() {
  const isValid = await checkInForm.value.validate()
  if (!isValid) return

  try {
    isLoading.value = true

    const tripData = {
      vehicule_id: newTrip.value.vehicleId,
      conducteur_id: 1, // À remplacer par l'ID de l'utilisateur connecté
      date_heure_depart: new Date().toISOString(),
      km_depart: newTrip.value.kmDepart,
      km_retour: 0,
      carburant_depart: newTrip.value.carburantDepart,
      carburant_retour: 0,
      proprete_depart: newTrip.value.propreteDepart,
      proprete_retour: '',
      commentaires: newTrip.value.commentaires,
      incidents: '',
      status: 'en_cours'
    }

    const { data, error } = await db.createTrip(tripData)
    if (error) throw error

    // Mettre à jour le statut du véhicule
    await db.updateVehicle(newTrip.value.vehicleId, { statut: 'reserve' })

    // Réinitialiser le formulaire
    newTrip.value = {
      vehicleId: null,
      kmDepart: null,
      carburantDepart: 3,
      propreteDepart: 'OK',
      commentaires: ''
    }

    // Recharger les données
    await loadTrips()
    await loadVehicles()

    if (window.showSnackbar) {
      window.showSnackbar('Trajet démarré avec succès', 'success')
    }

  } catch (err) {
    console.error('Erreur lors du démarrage du trajet:', err)
    if (window.showSnackbar) {
      window.showSnackbar('Erreur lors du démarrage du trajet', 'error')
    }
  } finally {
    isLoading.value = false
  }
}

// Terminer un trajet
async function endTrip() {
  const isValid = await checkOutForm.value.validate()
  if (!isValid) return

  try {
    isLoading.value = true

    const trip = trips.value.find(t => t.id === activeTrip.value.id)
    if (!trip) throw new Error('Trajet non trouvé')

    const updates = {
      date_heure_retour: new Date().toISOString(),
      km_retour: activeTrip.value.kmRetour,
      carburant_retour: activeTrip.value.carburantRetour,
      proprete_retour: activeTrip.value.propreteRetour,
      incidents: activeTrip.value.incidents,
      status: 'termine'
    }

    const { data, error } = await db.updateTrip(activeTrip.value.id, updates)
    if (error) throw error

    // Mettre à jour le statut du véhicule
    const newVehicleStatus = activeTrip.value.incidents ? 'maintenance' : 'disponible'
    await db.updateVehicle(trip.vehicule_id, { 
      statut: newVehicleStatus,
      kilometrage_actuel: activeTrip.value.kmRetour
    })

    // Réinitialiser le formulaire
    activeTrip.value = {
      id: null,
      kmRetour: null,
      carburantRetour: 3,
      propreteRetour: 'OK',
      incidents: ''
    }

    // Recharger les données
    await loadTrips()
    await loadVehicles()

    if (window.showSnackbar) {
      window.showSnackbar('Trajet terminé avec succès', 'success')
    }

  } catch (err) {
    console.error('Erreur lors de la fin du trajet:', err)
    if (window.showSnackbar) {
      window.showSnackbar('Erreur lors de la fin du trajet', 'error')
    }
  } finally {
    isLoading.value = false
  }
}

// Sélectionner un trajet pour le terminer
function selectTripForEnd(trip) {
  activeTrip.value.id = trip.id
  activeTrip.value.kmRetour = trip.km_depart + 50 // Valeur par défaut
}

// Charger les données
async function loadVehicles() {
  const { data, error } = await db.getVehicles()
  if (!error) {
    vehicles.value = data
  }
}

async function loadTrips() {
  const { data, error } = await db.getTrips()
  if (!error) {
    trips.value = data
  }
}

async function refreshTrips() {
  isLoading.value = true
  try {
    await Promise.all([loadVehicles(), loadTrips()])
  } finally {
    isLoading.value = false
  }
}

function viewTrip(trip) {
  router.push(`/trips/${trip.id}`)
}

// Chargement initial
onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([loadVehicles(), loadTrips()])
  } catch (err) {
    console.error('Erreur lors du chargement des données:', err)
  } finally {
    isLoading.value = false
  }
})
</script>
