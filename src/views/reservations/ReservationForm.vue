<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">
        {{ isEditing ? 'Modifier la réservation' : 'Nouvelle réservation' }}
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="submit">
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                v-model="form.vehicle_id"
                :items="availableVehicles"
                item-title="display"
                item-value="id"
                label="Véhicule"
                :rules="[v => !!v || 'Le véhicule est requis']"
                :loading="loadingVehicles"
                :disabled="isEditing"
                clearable
                required
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.purpose"
                label="Motif de la réservation"
                :rules="[v => !!v || 'Le motif est requis']"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.start_date"
                label="Date et heure de début"
                type="datetime-local"
                :rules="[v => !!v || 'La date de début est requise']"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.end_date"
                label="Date et heure de fin"
                type="datetime-local"
                :rules="[v => !!v || 'La date de fin est requise']"
                :min="form.start_date"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                label="Notes supplémentaires"
                rows="3"
              />
            </v-col>
          </v-row>

          <v-card-actions class="flex-column flex-sm-row">
            <v-btn 
              color="secondary" 
              variant="text" 
              @click="router.back()"
              :block="$vuetify.display.mobile"
              class="mb-2 mb-sm-0"
            >
              Annuler
            </v-btn>
            <v-spacer v-if="!$vuetify.display.mobile" />
            <v-btn 
              type="submit" 
              color="primary" 
              :loading="reservationStore.loading"
              :block="$vuetify.display.mobile"
            >
              {{ isEditing ? 'Mettre à jour' : 'Créer' }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format, parseISO } from 'date-fns'
import { useReservationStore } from '@/stores/reservation'
import { useVehicleStore } from '@/stores/vehicle'

const route = useRoute()
const router = useRouter()
const reservationStore = useReservationStore()
const vehicleStore = useVehicleStore()

const loadingVehicles = ref(false)
const availableVehicles = ref([])
const isEditing = computed(() => Boolean(route.params.id))

const form = ref({
  vehicle_id: null,
  purpose: '',
  start_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  end_date: format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
  notes: '',
  status: 'pending'
})

async function loadAvailableVehicles() {
  loadingVehicles.value = true
  try {
    await vehicleStore.loadVehicles()

    availableVehicles.value = vehicleStore.vehicles
      .filter(v => v.status === 'available')
      .filter(v =>
        !form.value.start_date || !form.value.end_date
          ? true
          : reservationStore.isVehicleAvailable(
              v.id,
              form.value.start_date,
              form.value.end_date
            )
      )
      .map(v => ({
        id: v.id,
        display: `${v.brand} ${v.model} (${v.plate_number})`
      }))
  } finally {
    loadingVehicles.value = false
  }
}

async function loadReservation() {
  if (!isEditing.value) return

  const reservation = await reservationStore.getReservationById(route.params.id)
  if (!reservation) return router.replace({ name: 'reservations' })

  form.value = {
    vehicle_id: reservation.vehicle_id,
    purpose: reservation.purpose,
    start_date: format(parseISO(reservation.start_date), "yyyy-MM-dd'T'HH:mm"),
    end_date: format(parseISO(reservation.end_date), "yyyy-MM-dd'T'HH:mm"),
    notes: reservation.notes || '',
    status: reservation.status
  }
}

async function submit() {
  const payload = {
    ...form.value,
    start_date: new Date(form.value.start_date).toISOString(),
    end_date: new Date(form.value.end_date).toISOString()
  }

  if (isEditing.value) {
    await reservationStore.updateReservation(route.params.id, payload)
  } else {
    await reservationStore.createReservation(payload)
  }

  router.push({ name: 'reservations' })
}

onMounted(async () => {
  await loadAvailableVehicles()
  await reservationStore.loadReservations()
  await loadReservation()
})

watch(
  () => [form.value.start_date, form.value.end_date],
  () => loadAvailableVehicles(),
  { deep: true }
)
</script>
