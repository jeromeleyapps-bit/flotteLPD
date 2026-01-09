<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-card variant="outlined">
          <v-card-title class="text-h4 mb-2">
            Engagement sécurité routière
          </v-card-title>
          <v-card-subtitle class="text-body-1 mb-4">
            Avant d'utiliser un véhicule de service, chaque collaborateur s'engage à respecter les règles ci-dessous.
          </v-card-subtitle>

          <v-divider class="mb-4" />

          <v-row class="px-4 pb-4" dense>
            <v-col cols="12" md="6">
              <v-sheet rounded border class="pa-4 h-100">
                <div class="text-h6 mb-2">
                  <v-icon color="warning" class="mr-2">mdi-alert-octagon</v-icon>
                  Principaux risques
                </div>
                <ul class="text-body-2 pl-4">
                  <li>Vitesse excessive ou inadaptée aux conditions météo.</li>
                  <li>Usage du téléphone ou distractions au volant.</li>
                  <li>Fatigue, alcool, stupéfiants ou médicaments.</li>
                  <li>Charge mal arrimée ou non-conformité du véhicule.</li>
                </ul>
              </v-sheet>
            </v-col>

            <v-col cols="12" md="6">
              <v-sheet rounded border class="pa-4 h-100">
                <div class="text-h6 mb-2">
                  <v-icon color="primary" class="mr-2">mdi-shield-check</v-icon>
                  Prévention & bonnes pratiques
                </div>
                <ul class="text-body-2 pl-4">
                  <li>Effectuer un contrôle visuel (pneus, feux, niveaux) avant chaque départ.</li>
                  <li>Programmer l'itinéraire avant de démarrer et utiliser le kit mains libres si nécessaire.</li>
                  <li>Respecter les limitations de vitesse et adapter sa conduite à l'environnement.</li>
                  <li>Faire une pause toutes les 2 heures et signaler toute anomalie au responsable parc.</li>
                </ul>
              </v-sheet>
            </v-col>

            <v-col cols="12" md="6">
              <v-sheet rounded border class="pa-4 h-100">
                <div class="text-h6 mb-2">
                  <v-icon color="error" class="mr-2">mdi-scale-balance</v-icon>
                  Obligations légales du salarié
                </div>
                <ul class="text-body-2 pl-4">
                  <li>Être titulaire d'un permis valide et signaler immédiatement toute suspension.</li>
                  <li>Respecter le code de la route et les procédures internes (carnet de bord, réservation).</li>
                  <li>Porter les équipements de sécurité (gilet, triangle) et signaler tout accident dans les 24h.</li>
                  <li>Assurer la propreté du véhicule et remonter toute panne ou entretien nécessaire.</li>
                </ul>
              </v-sheet>
            </v-col>

            <v-col cols="12" md="6">
              <v-sheet rounded border class="pa-4 h-100">
                <div class="text-h6 mb-2">
                  <v-icon color="success" class="mr-2">mdi-human-male-board</v-icon>
                  En cas d'infraction ou d'accident
                </div>
                <ul class="text-body-2 pl-4">
                  <li>Informer immédiatement votre responsable et le service RH.</li>
                  <li>Compléter le constat amiable et prendre des photos si possible.</li>
                  <li>Transmettre l'avis de contravention au service administratif sous 3 jours.</li>
                  <li>Suivre les démarches définies par l'assurance de l'association.</li>
                </ul>
              </v-sheet>
            </v-col>
          </v-row>

          <v-divider class="mb-4" />

          <v-card-actions class="flex-column flex-md-row">
            <v-checkbox
              v-model="acknowledged"
              hide-details
              :label="'Je confirme avoir pris connaissance de ces consignes.'"
              class="mb-4 mb-md-0"
            />
            <v-spacer />
            <v-btn
              color="primary"
              :disabled="!acknowledged"
              @click="proceed"
            >
              Accéder à l'application
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const acknowledged = ref(false)

function proceed() {
  router.push({ name: 'vehicles' })
}
</script>
