<template>
  <!-- Vue mobile : cartes -->
  <div v-if="mobile" class="reservation-cards">
    <v-card
      v-for="item in reservations"
      :key="item.id"
      class="mb-3"
      :to="`/reservations/${item.id}`"
    >
      <v-card-title class="d-flex justify-space-between align-center pb-2">
        <span class="text-subtitle-1">
          {{ item.vehicles?.brand }} {{ item.vehicles?.model }}
        </span>
        <v-chip size="small" :color="getStatusColor(item.status)">
          {{ getStatusText(item.status) }}
        </v-chip>
      </v-card-title>
      <v-card-subtitle class="pb-2">
        {{ item.vehicles?.plate_number }}
      </v-card-subtitle>
      <v-card-text class="pt-0">
        <div class="d-flex align-center mb-2">
          <v-icon size="small" class="mr-2">mdi-account</v-icon>
          <span class="text-body-2">{{ item.profiles?.full_name || 'Utilisateur inconnu' }}</span>
        </div>
        <div class="d-flex align-center mb-2">
          <v-icon size="small" class="mr-2">mdi-calendar-clock</v-icon>
          <span class="text-body-2">{{ formatDate(item.start_date) }} — {{ formatDate(item.end_date) }}</span>
        </div>
      </v-card-text>
      <v-card-actions v-if="canCancel(item)">
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="text"
          size="small"
          @click.stop="cancelReservation(item.id)"
        >
          <v-icon left size="small">mdi-cancel</v-icon>
          Annuler
        </v-btn>
      </v-card-actions>
    </v-card>
    <div v-if="reservations.length === 0" class="text-center py-8 text-medium-emphasis">
      Aucune réservation
    </div>
  </div>

  <!-- Vue desktop : tableau -->
  <v-data-table
    v-if="!mobile"
    :headers="headers"
    :items="reservations"
    :loading="reservationStore.loading"
    class="elevation-1"
    no-data-text="Aucune réservation"
  >
    <template #item.vehicle="{ item }">
      {{ item.vehicles?.brand }} {{ item.vehicles?.model }} ({{ item.vehicles?.plate_number }})
    </template>

    <template #item.user="{ item }">
      {{ item.profiles?.full_name || 'Utilisateur inconnu' }}
    </template>

    <template #item.dates="{ item }">
      {{ formatDate(item.start_date) }} — {{ formatDate(item.end_date) }}
    </template>

    <template #item.status="{ item }">
      <v-chip size="small" :color="getStatusColor(item.status)">
        {{ getStatusText(item.status) }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <v-btn
        icon
        variant="text"
        size="small"
        color="primary"
        :to="`/reservations/${item.id}`"
      >
        <v-icon>mdi-eye</v-icon>
      </v-btn>
      <v-btn
        v-if="canCancel(item)"
        icon
        variant="text"
        size="small"
        color="error"
        @click="cancelReservation(item.id)"
      >
        <v-icon>mdi-cancel</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script setup>
import { useReservationStore } from '@/stores/reservation'
import { useDisplay } from 'vuetify'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const { mobile } = useDisplay()

const props = defineProps({
  reservations: {
    type: Array,
    required: true
  }
})

const reservationStore = useReservationStore()

const headers = [
  { title: 'Véhicule', key: 'vehicle', sortable: true },
  { title: 'Utilisateur', key: 'user', sortable: true },
  { title: 'Période', key: 'dates', sortable: true },
  { title: 'Statut', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

function formatDate(dateString) {
  return format(new Date(dateString), 'Pp', { locale: fr })
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

function canCancel(reservation) {
  const now = new Date()
  const startDate = new Date(reservation.start_date)
  return ['pending', 'confirmed'].includes(reservation.status) && startDate > now
}

async function cancelReservation(id) {
  if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
    await reservationStore.cancelReservation(id)
  }
}
</script>
