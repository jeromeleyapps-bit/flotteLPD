/**
 * Adaptateur LocalStorage
 * Stocke toutes les données dans le navigateur
 * 
 * ⚠️ ATTENTION : Ne convient PAS pour une utilisation multi-utilisateurs !
 * Chaque navigateur a sa propre copie des données.
 * Les statuts des véhicules ne sont PAS synchronisés entre utilisateurs.
 * 
 * Utilisez uniquement pour :
 * - Tests personnels
 * - Développement solo
 * - Démonstrations sans autres utilisateurs
 * 
 * Pour production multi-utilisateurs, utilisez Supabase avec Realtime !
 */

export class LocalStorageAdapter {
  constructor() {
    this.storageKey = 'flotte-lpd-data'
    this.init()
  }

  init() {
    // Afficher un avertissement en mode production
    if (import.meta.env.PROD) {
      console.warn('⚠️ ATTENTION : LocalStorage est utilisé. Les données ne sont PAS synchronisées entre utilisateurs !')
      console.warn('⚠️ Pour une utilisation multi-utilisateurs, utilisez Supabase avec Realtime.')
    }
    
    // Initialiser les données si elles n'existent pas
    if (!localStorage.getItem(this.storageKey)) {
      const initialData = {
        users: [],
        profiles: [],
        vehicles: [],
        reservations: [],
        trips: [],
        maintenances: [],
        departments: [
          { id: '11111111-1111-1111-1111-111111111111', name: 'Alpes-de-Haute-Provence', code: '04' },
          { id: '22222222-2222-2222-2222-222222222222', name: 'Hautes-Alpes', code: '05' },
          { id: '33333333-3333-3333-3333-333333333333', name: 'Alpes-Maritimes', code: '06' },
          { id: '44444444-4444-4444-4444-444444444444', name: 'Bouches-du-Rhône', code: '13' },
          { id: '55555555-5555-5555-5555-555555555555', name: 'Var', code: '83' },
          { id: '66666666-6666-6666-6666-666666666666', name: 'Vaucluse', code: '84' }
        ]
      }
      this.saveData(initialData)
    }
  }

  getData() {
    const data = localStorage.getItem(this.storageKey)
    return data ? JSON.parse(data) : {}
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }

  // ========== AUTHENTIFICATION ==========
  
  async signIn(email, password) {
    const data = this.getData()
    const user = data.users?.find(u => u.email === email && u.password === password)
    
    if (!user) {
      throw new Error('Email ou mot de passe incorrect')
    }
    
    // Stocker la session
    localStorage.setItem('flotte-lpd-session', JSON.stringify({
      user: { id: user.id, email: user.email },
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 jours
    }))
    
    return { user: { id: user.id, email: user.email }, error: null }
  }

  async signUp(email, password, userData) {
    const data = this.getData()
    
    // Vérifier si l'utilisateur existe déjà
    if (data.users?.some(u => u.email === email)) {
      throw new Error('Cet email est déjà utilisé')
    }
    
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password, // ⚠️ En production, hasher le mot de passe !
      ...userData,
      created_at: new Date().toISOString()
    }
    
    const newProfile = {
      id: newUser.id,
      full_name: userData.fullName || email,
      email,
      role: 'user',
      department_id: null,
      created_at: new Date().toISOString()
    }
    
    if (!data.users) data.users = []
    if (!data.profiles) data.profiles = []
    
    data.users.push(newUser)
    data.profiles.push(newProfile)
    this.saveData(data)
    
    // Créer la session
    await this.signIn(email, password)
    
    return { user: { ...newUser, ...newProfile }, error: null }
  }

  async signOut() {
    localStorage.removeItem('flotte-lpd-session')
    return { success: true }
  }

  async getSession() {
    const session = localStorage.getItem('flotte-lpd-session')
    if (!session) return { session: null, error: null }
    
    const sessionData = JSON.parse(session)
    if (sessionData.expires < Date.now()) {
      localStorage.removeItem('flotte-lpd-session')
      return { session: null, error: null }
    }
    
    return { session: sessionData, error: null }
  }

  async getUser() {
    const { session } = await this.getSession()
    if (!session) return { user: null, error: null }
    
    const data = this.getData()
    const profile = data.profiles?.find(p => p.id === session.user.id)
    
    if (profile) {
      let department = null
      if (profile.department_id) {
        department = data.departments?.find(d => d.id === profile.department_id)
      }
      
      return {
        user: {
          ...session.user,
          ...profile,
          department_name: department?.name || null
        },
        error: null
      }
    }
    
    return { user: session.user, error: null }
  }

  // ========== VÉHICULES ==========
  
  async getVehicles(filters = {}) {
    const data = this.getData()
    let vehicles = data.vehicles || []
    
    // Appliquer les filtres
    if (filters.department_id) {
      vehicles = vehicles.filter(v => v.department_id === filters.department_id)
    }
    
    // Joindre les départements
    vehicles = vehicles.map(vehicle => {
      const department = data.departments?.find(d => d.id === vehicle.department_id)
      return {
        ...vehicle,
        department_name: department?.name || 'Non assigné',
        department_code: department?.code || ''
      }
    })
    
    return { data: vehicles, error: null }
  }

  async createVehicle(vehicleData) {
    const data = this.getData()
    if (!data.vehicles) data.vehicles = []
    
    const newVehicle = {
      id: `vehicle-${Date.now()}`,
      ...vehicleData,
      status: 'available',
      created_at: new Date().toISOString()
    }
    
    data.vehicles.push(newVehicle)
    this.saveData(data)
    
    const department = data.departments?.find(d => d.id === newVehicle.department_id)
    return {
      data: {
        ...newVehicle,
        department_name: department?.name || 'Non assigné',
        department_code: department?.code || ''
      },
      error: null
    }
  }

  async updateVehicle(vehicleId, updates) {
    const data = this.getData()
    const index = data.vehicles?.findIndex(v => v.id === vehicleId)
    
    if (index === -1 || !data.vehicles) {
      return { data: null, error: { message: 'Véhicule non trouvé' } }
    }
    
    data.vehicles[index] = {
      ...data.vehicles[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    this.saveData(data)
    
    const department = data.departments?.find(d => d.id === data.vehicles[index].department_id)
    return {
      data: {
        ...data.vehicles[index],
        department_name: department?.name || 'Non assigné',
        department_code: department?.code || ''
      },
      error: null
    }
  }

  async deleteVehicle(vehicleId) {
    const data = this.getData()
    if (!data.vehicles) return { error: { message: 'Aucun véhicule' } }
    
    data.vehicles = data.vehicles.filter(v => v.id !== vehicleId)
    this.saveData(data)
    
    return { error: null }
  }

  // ========== RÉSERVATIONS ==========
  
  async getReservations(filters = {}) {
    const data = this.getData()
    let reservations = data.reservations || []
    
    if (filters.user_id) {
      reservations = reservations.filter(r => r.user_id === filters.user_id)
    }
    
    // Joindre les véhicules et profils
    reservations = reservations.map(reservation => {
      const vehicle = data.vehicles?.find(v => v.id === reservation.vehicle_id)
      const profile = data.profiles?.find(p => p.id === reservation.user_id)
      
      return {
        ...reservation,
        vehicles: vehicle ? {
          plate_number: vehicle.plate_number,
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type
        } : null,
        profiles: profile ? {
          full_name: profile.full_name,
          email: profile.email
        } : null
      }
    })
    
    return { data: reservations, error: null }
  }

  async createReservation(reservationData) {
    const data = this.getData()
    if (!data.reservations) data.reservations = []
    
    const newReservation = {
      id: `reservation-${Date.now()}`,
      ...reservationData,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    
    data.reservations.push(newReservation)
    
    // Mettre à jour le statut du véhicule
    if (data.vehicles) {
      const vehicleIndex = data.vehicles.findIndex(v => v.id === reservationData.vehicle_id)
      if (vehicleIndex !== -1) {
        data.vehicles[vehicleIndex].status = 'reserved'
      }
    }
    
    this.saveData(data)
    
    const vehicle = data.vehicles?.find(v => v.id === reservationData.vehicle_id)
    const profile = data.profiles?.find(p => p.id === newReservation.user_id)
    
    return {
      data: {
        ...newReservation,
        vehicles: vehicle ? {
          plate_number: vehicle.plate_number,
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type
        } : null,
        profiles: profile ? {
          full_name: profile.full_name,
          email: profile.email
        } : null
      },
      error: null
    }
  }

  async updateReservation(reservationId, updates) {
    const data = this.getData()
    const index = data.reservations?.findIndex(r => r.id === reservationId)
    
    if (index === -1 || !data.reservations) {
      return { data: null, error: { message: 'Réservation non trouvée' } }
    }
    
    data.reservations[index] = {
      ...data.reservations[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    this.saveData(data)
    
    const reservation = data.reservations[index]
    const vehicle = data.vehicles?.find(v => v.id === reservation.vehicle_id)
    const profile = data.profiles?.find(p => p.id === reservation.user_id)
    
    return {
      data: {
        ...reservation,
        vehicles: vehicle ? {
          plate_number: vehicle.plate_number,
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type
        } : null,
        profiles: profile ? {
          full_name: profile.full_name,
          email: profile.email
        } : null
      },
      error: null
    }
  }

  // ========== TRAJETS ==========
  
  async getTrips(filters = {}) {
    const data = this.getData()
    let trips = data.trips || []
    
    if (filters.user_id) {
      trips = trips.filter(t => t.conducteur_id === filters.user_id)
    }
    
    // Joindre les véhicules
    trips = trips.map(trip => {
      const vehicle = data.vehicles?.find(v => v.id === trip.vehicule_id)
      return {
        ...trip,
        vehicle_nom: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Véhicule inconnu'
      }
    })
    
    return { data: trips, error: null }
  }

  async createTrip(tripData) {
    const data = this.getData()
    if (!data.trips) data.trips = []
    
    const newTrip = {
      id: `trip-${Date.now()}`,
      ...tripData,
      created_at: new Date().toISOString()
    }
    
    data.trips.push(newTrip)
    
    // Mettre à jour le statut du véhicule
    if (data.vehicles) {
      const vehicleIndex = data.vehicles.findIndex(v => v.id === tripData.vehicule_id)
      if (vehicleIndex !== -1) {
        data.vehicles[vehicleIndex].status = 'reserve'
      }
    }
    
    this.saveData(data)
    
    return { data: newTrip, error: null }
  }

  async updateTrip(tripId, updates) {
    const data = this.getData()
    const index = data.trips?.findIndex(t => t.id === tripId)
    
    if (index === -1 || !data.trips) {
      return { data: null, error: { message: 'Trajet non trouvé' } }
    }
    
    data.trips[index] = {
      ...data.trips[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    this.saveData(data)
    
    return { data: data.trips[index], error: null }
  }

  // ========== MAINTENANCES ==========
  
  async getMaintenances(filters = {}) {
    const data = this.getData()
    let maintenances = data.maintenances || []
    
    if (filters.vehicle_id) {
      maintenances = maintenances.filter(m => m.vehicle_id === filters.vehicle_id)
    }
    
    // Joindre les véhicules
    maintenances = maintenances.map(maintenance => {
      const vehicle = data.vehicles?.find(v => v.id === maintenance.vehicle_id)
      return {
        ...maintenance,
        vehicle_name: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Véhicule inconnu'
      }
    })
    
    return { data: maintenances, error: null }
  }

  // ========== DÉPARTEMENTS ==========
  
  async getDepartments() {
    const data = this.getData()
    return { data: data.departments || [], error: null }
  }

  async updateProfile(profileId, updates) {
    const data = this.getData()
    const index = data.profiles?.findIndex(p => p.id === profileId)
    
    if (index === -1 || !data.profiles) {
      return { data: null, error: { message: 'Profil non trouvé' } }
    }
    
    data.profiles[index] = {
      ...data.profiles[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    this.saveData(data)
    
    return { data: data.profiles[index], error: null }
  }
}
