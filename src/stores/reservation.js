import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'

export const useReservationStore = defineStore('reservation', () => {
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
  
  const reservations = ref([])
  const loading = ref(false)
  const error = ref(null)

  const userReservations = computed(() => {
    const userId = localStorage.getItem('currentUserId')
    return reservations.value.filter(r => r.user_id === userId)
  })

  const activeReservations = computed(() => 
    reservations.value.filter(r => ['pending', 'confirmed', 'in_progress'].includes(r.status))
  )

  async function loadReservations(userId = null) {
    try {
      loading.value = true
      error.value = null
      
      // En mode dev, retourner des données fictives
      if (DEV_MODE) {
        console.log('🔧 Mode dev : Chargement de réservations fictives')
        await new Promise(resolve => setTimeout(resolve, 300))
        reservations.value = []
        return
      }
      
      let query = supabase
        .from('reservations')
        .select(`
          *,
          vehicles (
            plate_number,
            brand,
            model,
            type
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
      
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      
      reservations.value = data
    } catch (err) {
      console.error('Erreur lors du chargement des réservations:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createReservation(reservationData) {
    try {
      loading.value = true
      error.value = null
      
      // En mode dev, simuler la création
      if (DEV_MODE) {
        console.log('🔧 Mode dev : Création de réservation fictive')
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const newReservation = {
          id: `dev-reservation-${Date.now()}`,
          ...reservationData,
          status: 'pending',
          user_id: 'dev-user-123',
          created_at: new Date().toISOString(),
          vehicles: {
            plate_number: 'AA-123-AA',
            brand: 'Renault',
            model: 'Dokker',
            type: 'utilitaire'
          },
          profiles: {
            full_name: 'Utilisateur Test',
            email: 'dev@test.local'
          }
        }
        
        reservations.value.unshift(newReservation)
        return newReservation
      }
      
      // Vérifier si le véhicule est disponible
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('status')
        .eq('id', reservationData.vehicle_id)
        .single()
      
      if (vehicleError) throw vehicleError
      if (vehicle.status !== 'available') {
        throw new Error('Ce véhicule n\'est pas disponible')
      }
      
      // Créer la réservation
      const { data, error: insertError } = await supabase
        .from('reservations')
        .insert({
          ...reservationData,
          status: 'pending'
        })
        .select(`
          *,
          vehicles (
            plate_number,
            brand,
            model,
            type
          ),
          profiles (
            full_name,
            email
          )
        `)
        .single()
      
      if (insertError) throw insertError
      
      // Mettre à jour le statut du véhicule
      await supabase
        .from('vehicles')
        .update({ status: 'reserved' })
        .eq('id', reservationData.vehicle_id)
      
      reservations.value.unshift(data)
      return data
    } catch (err) {
      console.error('Erreur lors de la création de la réservation:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateReservation(reservationId, updates) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', reservationId)
        .select(`
          *,
          vehicles (
            plate_number,
            brand,
            model,
            type
          ),
          profiles (
            full_name,
            email
          )
        `)
        .single()
      
      if (updateError) throw updateError
      
      const index = reservations.value.findIndex(r => r.id === reservationId)
      if (index !== -1) {
        reservations.value[index] = data
      }
      
      return data
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la réservation:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmReservation(reservationId) {
    const reservation = await updateReservation(reservationId, {
      status: 'confirmed',
      updated_at: new Date().toISOString()
    })
    
    // Mettre à jour le statut du véhicule
    await supabase
      .from('vehicles')
      .update({ status: 'in_use' })
      .eq('id', reservation.vehicle_id)
    
    return reservation
  }

  async function cancelReservation(reservationId) {
    try {
      loading.value = true
      const reservation = await getReservationById(reservationId)

      if (reservation) {
        await supabase
          .from('vehicles')
          .update({ status: 'available' })
          .eq('id', reservation.vehicle_id)
      }

      await updateReservation(reservationId, {
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
    } catch (err) {
      console.error('Erreur lors de l\'annulation de la réservation:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function completeReservation(reservationId) {
    const reservation = await updateReservation(reservationId, {
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    
    // Remettre le véhicule comme disponible
    await supabase
      .from('vehicles')
      .update({ status: 'available' })
      .eq('id', reservation.vehicle_id)
    
    return reservation
  }

  async function getReservationById(reservationId) {
    const existing = reservations.value.find(r => r.id === reservationId)
    if (existing) return existing

    try {
      loading.value = true
      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select(`
          *,
          vehicles (
            plate_number,
            brand,
            model,
            type
          ),
          profiles (
            full_name,
            email
          )
        `)
        .eq('id', reservationId)
        .maybeSingle()

      if (fetchError) throw fetchError
      if (data) {
        const index = reservations.value.findIndex(r => r.id === reservationId)
        if (index === -1) {
          reservations.value.push(data)
        } else {
          reservations.value[index] = data
        }
      }

      return data || null
    } catch (err) {
      console.error('Erreur lors de la récupération de la réservation:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function isVehicleAvailable(vehicleId, startDate, endDate) {
    const requestedStart = new Date(startDate)
    const requestedEnd = new Date(endDate)

    return !reservations.value.some(r => {
      if (r.vehicle_id !== vehicleId) return false
      if (!['confirmed', 'in_progress', 'pending'].includes(r.status)) return false

      const reservationStart = new Date(r.start_date)
      const reservationEnd = new Date(r.end_date)

      const overlaps =
        (requestedStart >= reservationStart && requestedStart <= reservationEnd) ||
        (requestedEnd >= reservationStart && requestedEnd <= reservationEnd) ||
        (requestedStart <= reservationStart && requestedEnd >= reservationEnd)

      return overlaps
    })
  }

  return {
    reservations,
    loading,
    error,
    userReservations,
    activeReservations,
    loadReservations,
    createReservation,
    updateReservation,
    confirmReservation,
    cancelReservation,
    completeReservation,
    getReservationById,
    isVehicleAvailable
  }
})
