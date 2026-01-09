/**
 * Adaptateur Supabase
 * Wrapper autour de Supabase pour l'interface standardisée
 */

import { createClient } from '@supabase/supabase-js'

export class SupabaseAdapter {
  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variables d\'environnement Supabase manquantes')
    }
    
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
    
    // Configurer les subscriptions en temps réel pour la synchronisation
    this.setupRealtimeSubscriptions()
  }

  // ========== AUTHENTIFICATION ==========
  
  async signIn(email, password) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { user: data.user, error: null }
  }

  async signUp(email, password, userData) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName,
          role: 'user'
        }
      }
    })
    if (error) throw error
    
    // Créer le profil
    if (data.user) {
      await this.client.from('profiles').insert({
        id: data.user.id,
        full_name: userData.fullName,
        email,
        role: 'user'
      })
    }
    
    return { user: data.user, error: null }
  }

  async signOut() {
    const { error } = await this.client.auth.signOut()
    if (error) throw error
    return { success: true }
  }

  async getSession() {
    const { data, error } = await this.client.auth.getSession()
    return { session: data.session, error }
  }

  async getUser() {
    const { data, error } = await this.client.auth.getUser()
    if (error || !data.user) return { user: null, error }
    
    // Charger le profil
    const { data: profile } = await this.client
      .from('profiles')
      .select('*, departments(name)')
      .eq('id', data.user.id)
      .maybeSingle()
    
    return {
      user: {
        ...data.user,
        ...profile,
        department_name: profile?.departments?.name || null
      },
      error: null
    }
  }

  // ========== VÉHICULES ==========
  
  async getVehicles(filters = {}) {
    let query = this.client.from('vehicles').select('*, departments(name, code)')
    
    if (filters.department_id) {
      query = query.eq('department_id', filters.department_id)
    }
    
    const { data, error } = await query.order('brand, model')
    
    if (error) return { data: null, error }
    
    const vehicles = data.map(v => ({
      ...v,
      department_name: v.departments?.name || 'Non assigné',
      department_code: v.departments?.code || ''
    }))
    
    return { data: vehicles, error: null }
  }

  async createVehicle(vehicleData) {
    const { data, error } = await this.client
      .from('vehicles')
      .insert(vehicleData)
      .select('*, departments(name, code)')
      .single()
    
    if (error) return { data: null, error }
    
    return {
      data: {
        ...data,
        department_name: data.departments?.name || 'Non assigné',
        department_code: data.departments?.code || ''
      },
      error: null
    }
  }

  async updateVehicle(vehicleId, updates) {
    const { data, error } = await this.client
      .from('vehicles')
      .update(updates)
      .eq('id', vehicleId)
      .select('*, departments(name, code)')
      .single()
    
    if (error) return { data: null, error }
    
    return {
      data: {
        ...data,
        department_name: data.departments?.name || 'Non assigné',
        department_code: data.departments?.code || ''
      },
      error: null
    }
  }

  async deleteVehicle(vehicleId) {
    const { error } = await this.client
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)
    
    return { error }
  }

  // ========== RÉSERVATIONS ==========
  
  async getReservations(filters = {}) {
    let query = this.client
      .from('reservations')
      .select('*, vehicles(plate_number, brand, model, type), profiles(full_name, email)')
      .order('created_at', { ascending: false })
    
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    
    const { data, error } = await query
    return { data, error }
  }

  async createReservation(reservationData) {
    const { data, error } = await this.client
      .from('reservations')
      .insert({ ...reservationData, status: 'pending' })
      .select('*, vehicles(plate_number, brand, model, type), profiles(full_name, email)')
      .single()
    
    if (error) return { data: null, error }
    
    // Mettre à jour le statut du véhicule
    await this.client
      .from('vehicles')
      .update({ status: 'reserved' })
      .eq('id', reservationData.vehicle_id)
    
    return { data, error: null }
  }

  async updateReservation(reservationId, updates) {
    const { data, error } = await this.client
      .from('reservations')
      .update(updates)
      .eq('id', reservationId)
      .select('*, vehicles(plate_number, brand, model, type), profiles(full_name, email)')
      .single()
    
    return { data, error }
  }

  // ========== TRAJETS ==========
  
  async getTrips(filters = {}) {
    let query = this.client
      .from('trips')
      .select('*, vehicles(brand, model)')
      .order('date_heure_depart', { ascending: false })
    
    if (filters.user_id) {
      query = query.eq('conducteur_id', filters.user_id)
    }
    
    const { data, error } = await query
    
    if (error) return { data: null, error }
    
    const trips = data.map(t => ({
      ...t,
      vehicle_nom: t.vehicles ? `${t.vehicles.brand} ${t.vehicles.model}` : 'Véhicule inconnu'
    }))
    
    return { data: trips, error: null }
  }

  async createTrip(tripData) {
    const { data, error } = await this.client
      .from('trips')
      .insert(tripData)
      .select()
      .single()
    
    if (error) return { data: null, error }
    
    // Mettre à jour le statut du véhicule
    await this.client
      .from('vehicles')
      .update({ status: 'reserve' })
      .eq('id', tripData.vehicule_id)
    
    return { data, error: null }
  }

  async updateTrip(tripId, updates) {
    const { data, error } = await this.client
      .from('trips')
      .update(updates)
      .eq('id', tripId)
      .select()
      .single()
    
    return { data, error }
  }

  // ========== MAINTENANCES ==========
  
  async getMaintenances(filters = {}) {
    let query = this.client
      .from('maintenances')
      .select('*, vehicles(brand, model)')
      .order('date_prevue', { ascending: true })
    
    if (filters.vehicle_id) {
      query = query.eq('vehicle_id', filters.vehicle_id)
    }
    
    const { data, error } = await query
    
    if (error) return { data: null, error }
    
    const maintenances = data.map(m => ({
      ...m,
      vehicle_name: m.vehicles ? `${m.vehicles.brand} ${m.vehicles.model}` : 'Véhicule inconnu'
    }))
    
    return { data: maintenances, error: null }
  }

  // ========== DÉPARTEMENTS ==========
  
  async getDepartments() {
    const { data, error } = await this.client
      .from('departments')
      .select('*')
      .order('name')
    
    return { data, error }
  }

  async updateProfile(profileId, updates) {
    const { data, error } = await this.client
      .from('profiles')
      .update(updates)
      .eq('id', profileId)
      .select('*, departments(name)')
      .single()
    
    if (error) return { data: null, error }
    
    return {
      data: {
        ...data,
        department_name: data.departments?.name || null
      },
      error: null
    }
  }

  // ========== SYNCHRONISATION TEMPS RÉEL ==========
  
  setupRealtimeSubscriptions() {
    // Les subscriptions seront gérées par les stores qui en ont besoin
    // Cette méthode peut être étendue pour configurer des subscriptions globales
  }

  /**
   * S'abonner aux changements de véhicules en temps réel
   * @param {Function} callback - Fonction appelée à chaque changement
   * @returns {Function} Fonction pour se désabonner
   */
  subscribeToVehicles(callback) {
    const channel = this.client
      .channel('vehicles-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'vehicles'
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()

    // Retourner la fonction de désabonnement
    return () => {
      this.client.removeChannel(channel)
    }
  }

  /**
   * S'abonner aux changements de réservations en temps réel
   * @param {Function} callback - Fonction appelée à chaque changement
   * @returns {Function} Fonction pour se désabonner
   */
  subscribeToReservations(callback) {
    const channel = this.client
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()

    return () => {
      this.client.removeChannel(channel)
    }
  }

  /**
   * S'abonner aux changements de trajets en temps réel
   * @param {Function} callback - Fonction appelée à chaque changement
   * @returns {Function} Fonction pour se désabonner
   */
  subscribeToTrips(callback) {
    const channel = this.client
      .channel('trips-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips'
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()

    return () => {
      this.client.removeChannel(channel)
    }
  }
}
