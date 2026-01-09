<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-btn icon variant="text" class="mr-2" @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <div class="text-h6">Réservation #{{ reservation?.id }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ reservation?.vehicles?.brand }} {{ reservation?.vehicles?.model }}
          </div>
        </div>
        <v-spacer />
        <v-chip size="small" :color="getStatusColor(reservation?.status)">
          {{ getStatusText(reservation?.status) }}
        </v-chip>
      </v-card-title>

      <v-divider />

      <v-card-text v-if="loading">
        <v-progress-linear indeterminate color="primary" />
      </v-card-text>

      <v-card-text v-else-if="!reservation">
        <v-alert type="warning" variant="tonal">
          Réservation introuvable
        </v-alert>
      </v-card-text>

      <v-card-text v-else>
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-subtitle-1">Véhicule</v-card-title>
              <v-card-text>
                <div><strong>Marque/Modèle :</strong> {{ reservation.vehicles?.brand }} {{ reservation.vehicles?.model }}</div>
                <div><strong>Immatriculation :</strong> {{ reservation.vehicles?.plate_number }}</div>
                <div><strong>Type :</strong> {{ reservation.vehicles?.type }}</div>
              </v-card-text>
            </v-card>

            <v-card variant="outlined">
              <v-card-title class="text-subtitle-1">Période</v-card-title>
              <v-card-text>
                <div><strong>Début :</strong> {{ formatDate(reservation.start_date) }}</div>
                <div><strong>Fin :</strong> {{ formatDate(reservation.end_date) }}</div>
                <div><strong>Durée :</strong> {{ getDuration(reservation.start_date, reservation.end_date) }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-subtitle-1">Utilisateur</v-card-title>
              <v-card-text>
                <div><strong>Nom :</strong> {{ reservation.profiles?.full_name || 'Non renseigné' }}</div>
                <div><strong>Email :</strong> {{ reservation.profiles?.email || 'Non renseigné' }}</div>
              </v-card-text>
            </v-card>

            <v-card variant="outlined">
              <v-card-title class="text-subtitle-1">Détails</v-card-title>
              <v-card-text>
                <div><strong>Motif :</strong> {{ reservation.purpose || 'Non renseigné' }}</div>
                <div v-if="reservation.notes"><strong>Notes :</strong> {{ reservation.notes }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions v-if="reservation">
        <v-spacer />
        <v-btn
          v-if="canEdit"
          color="primary"
          :to="{ name: 'edit-reservation', params: { id: reservation.id } }"
        >
          Modifier
        </v-btn>
        <v-btn
          v-if="canCancel"
          color="error"
          :loading="cancelling"
          @click="cancel"
        >
          Annuler
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { differenceInDays, differenceInHours, differenceInMinutes, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useReservationStore } from '@/stores/reservation'

const route = useRoute()
const router = useRouter()
const reservationStore = useReservationStore()

const reservation = ref(null)
const loading = ref(true)
const cancelling = ref(false)

const canEdit = computed(() => ['pending', 'confirmed'].includes(reservation.value?.status))
const canCancel = computed(() => {
  if (!reservation.value) return false
  const start = new Date(reservation.value.start_date)
  return canEdit.value && start > new Date()
})

function formatDate(date) {
  return format(new Date(date), 'PPpp', { locale: fr })
}

function getDuration(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const days = differenceInDays(e, s)
  const hours = differenceInHours(e, s) % 24
  const minutes = differenceInMinutes(e, s) % 60

  const parts = []
  if (days) parts.push(`${days} jour${days > 1 ? 's' : ''}`)
  if (hours) parts.push(`${hours} heure${hours > 1 ? 's' : ''}`)
  if (minutes || !parts.length) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
  return parts.join(' et ')
}

function getStatusColor(status) {
  const colors = {
    pending: 'warning',
    confirmed: 'info',
    in_progress: 'success',
    completed: 'success',
    cancelled: 'error',
    rejected: 'error'
  }
  return colors[status] || 'grey'
}

function getStatusText(status) {
  const texts = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    in_progress: 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
    rejected: 'Rejetée'
  }
  return texts[status] || status
}

async function loadReservation() {
  loading.value = true
  try {
    const data = await reservationStore.getReservationById(route.params.id)
    reservation.value = data
  } finally {
    loading.value = false
  }
}

async function cancel() {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return
  cancelling.value = true
  try {
    await reservationStore.cancelReservation(reservation.value.id)
    await loadReservation()
  } finally {
    cancelling.value = false
  }
}

onMounted(loadReservation)
</script>
