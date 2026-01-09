<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 mb-1">Gestion des réservations</h1>
        <p class="text-body-2 text-medium-emphasis">Suivez l'état des réservations et gérez les actions rapides.</p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        :to="{ name: 'create-reservation' }"
        :size="$vuetify.display.mobile ? 'default' : 'default'"
        :block="$vuetify.display.mobile"
      >
        Nouvelle réservation
      </v-btn>
    </div>

    <v-card>
      <v-tabs 
        v-model="tab" 
        bg-color="primary" 
        :grow="$vuetify.display.mobile"
        :centered="!$vuetify.display.mobile"
      >
        <v-tab value="upcoming">À venir</v-tab>
        <v-tab value="current">En cours</v-tab>
        <v-tab value="past">Passées</v-tab>
        <v-tab value="cancelled">Annulées</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="upcoming">
          <reservation-list :reservations="upcomingReservations" />
        </v-window-item>
        <v-window-item value="current">
          <reservation-list :reservations="currentReservations" />
        </v-window-item>
        <v-window-item value="past">
          <reservation-list :reservations="pastReservations" />
        </v-window-item>
        <v-window-item value="cancelled">
          <reservation-list :reservations="cancelledReservations" />
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReservationStore } from '@/stores/reservation'
import ReservationList from '@/components/reservations/ReservationList.vue'

const reservationStore = useReservationStore()
const tab = ref('upcoming')

const upcomingReservations = computed(() =>
  reservationStore.reservations.filter(r =>
    new Date(r.start_date) > new Date() &&
    ['pending', 'confirmed'].includes(r.status)
  )
)

const currentReservations = computed(() =>
  reservationStore.reservations.filter(r => {
    const now = new Date()
    const start = new Date(r.start_date)
    const end = new Date(r.end_date)
    return start <= now && end >= now && ['confirmed', 'in_progress'].includes(r.status)
  })
)

const pastReservations = computed(() =>
  reservationStore.reservations.filter(r =>
    new Date(r.end_date) < new Date() && r.status === 'completed'
  )
)

const cancelledReservations = computed(() =>
  reservationStore.reservations.filter(r => ['cancelled', 'rejected'].includes(r.status))
)

onMounted(async () => {
  if (!reservationStore.reservations.length) {
    await reservationStore.loadReservations()
  }
})
</script>
