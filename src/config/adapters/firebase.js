/**
 * Adaptateur Firebase
 * Utilise Firestore pour la base de données et Firebase Auth pour l'authentification
 * 
 * Configuration requise dans .env :
 * VITE_FIREBASE_API_KEY=votre_cle_api
 * VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
 * VITE_FIREBASE_PROJECT_ID=votre_projet_id
 * VITE_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
 * VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
 * VITE_FIREBASE_APP_ID=votre_app_id
 */

import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore'

export class FirebaseAdapter {
  constructor() {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    }

    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Variables d\'environnement Firebase manquantes')
    }

    this.app = initializeApp(firebaseConfig)
    this.auth = getAuth(this.app)
    this.db = getFirestore(this.app)
  }

  // ========== AUTHENTIFICATION ==========
  
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      const user = userCredential.user
      
      // Charger le profil
      const profileDoc = await getDoc(doc(this.db, 'profiles', user.uid))
      const profile = profileDoc.exists() ? profileDoc.data() : null
      
      return {
        user: {
          id: user.uid,
          email: user.email,
          ...profile
        },
        error: null
      }
    } catch (error) {
      throw error
    }
  }

  async signUp(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)
      const user = userCredential.user
      
      // Créer le profil
      const profileData = {
        id: user.uid,
        full_name: userData.fullName || email,
        email,
        role: 'user',
        department_id: null,
        created_at: Timestamp.now()
      }
      
      await addDoc(collection(this.db, 'profiles'), profileData)
      
      return {
        user: {
          id: user.uid,
          email: user.email,
          ...profileData
        },
        error: null
      }
    } catch (error) {
      throw error
    }
  }

  async signOut() {
    try {
      await firebaseSignOut(this.auth)
      return { success: true }
    } catch (error) {
      throw error
    }
  }

  async getSession() {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        resolve({ session: user ? { user } : null, error: null })
      })
    })
  }

  async getUser() {
    const user = this.auth.currentUser
    if (!user) return { user: null, error: null }
    
    try {
      const profileDoc = await getDoc(doc(this.db, 'profiles', user.uid))
      const profile = profileDoc.exists() ? profileDoc.data() : null
      
      let department = null
      if (profile?.department_id) {
        const deptDoc = await getDoc(doc(this.db, 'departments', profile.department_id))
        department = deptDoc.exists() ? deptDoc.data() : null
      }
      
      return {
        user: {
          id: user.uid,
          email: user.email,
          ...profile,
          department_name: department?.name || null
        },
        error: null
      }
    } catch (error) {
      return { user: null, error }
    }
  }

  // ========== VÉHICULES ==========
  
  async getVehicles(filters = {}) {
    try {
      let q = collection(this.db, 'vehicles')
      
      if (filters.department_id) {
        q = query(q, where('department_id', '==', filters.department_id))
      }
      
      q = query(q, orderBy('brand'), orderBy('model'))
      
      const snapshot = await getDocs(q)
      const vehicles = []
      
      for (const vehicleDoc of snapshot.docs) {
        const vehicle = { id: vehicleDoc.id, ...vehicleDoc.data() }
        
        // Charger le département
        if (vehicle.department_id) {
          const deptDoc = await getDoc(doc(this.db, 'departments', vehicle.department_id))
          if (deptDoc.exists()) {
            vehicle.department_name = deptDoc.data().name
            vehicle.department_code = deptDoc.data().code
          }
        }
        
        vehicles.push(vehicle)
      }
      
      return { data: vehicles, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async createVehicle(vehicleData) {
    try {
      const docRef = await addDoc(collection(this.db, 'vehicles'), {
        ...vehicleData,
        status: 'available',
        created_at: Timestamp.now()
      })
      
      const vehicleDoc = await getDoc(docRef)
      const vehicle = { id: vehicleDoc.id, ...vehicleDoc.data() }
      
      // Charger le département
      if (vehicle.department_id) {
        const deptDoc = await getDoc(doc(this.db, 'departments', vehicle.department_id))
        if (deptDoc.exists()) {
          vehicle.department_name = deptDoc.data().name
          vehicle.department_code = deptDoc.data().code
        }
      }
      
      return { data: vehicle, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateVehicle(vehicleId, updates) {
    try {
      const vehicleRef = doc(this.db, 'vehicles', vehicleId)
      await updateDoc(vehicleRef, {
        ...updates,
        updated_at: Timestamp.now()
      })
      
      const vehicleDoc = await getDoc(vehicleRef)
      const vehicle = { id: vehicleDoc.id, ...vehicleDoc.data() }
      
      // Charger le département
      if (vehicle.department_id) {
        const deptDoc = await getDoc(doc(this.db, 'departments', vehicle.department_id))
        if (deptDoc.exists()) {
          vehicle.department_name = deptDoc.data().name
          vehicle.department_code = deptDoc.data().code
        }
      }
      
      return { data: vehicle, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async deleteVehicle(vehicleId) {
    try {
      await deleteDoc(doc(this.db, 'vehicles', vehicleId))
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // ========== RÉSERVATIONS ==========
  
  async getReservations(filters = {}) {
    try {
      let q = collection(this.db, 'reservations')
      q = query(q, orderBy('created_at', 'desc'))
      
      if (filters.user_id) {
        q = query(q, where('user_id', '==', filters.user_id))
      }
      
      const snapshot = await getDocs(q)
      const reservations = []
      
      for (const resDoc of snapshot.docs) {
        const reservation = { id: resDoc.id, ...resDoc.data() }
        
        // Charger le véhicule
        if (reservation.vehicle_id) {
          const vehicleDoc = await getDoc(doc(this.db, 'vehicles', reservation.vehicle_id))
          if (vehicleDoc.exists()) {
            const vehicle = vehicleDoc.data()
            reservation.vehicles = {
              plate_number: vehicle.plate_number,
              brand: vehicle.brand,
              model: vehicle.model,
              type: vehicle.type
            }
          }
        }
        
        // Charger le profil
        if (reservation.user_id) {
          const profileDoc = await getDoc(doc(this.db, 'profiles', reservation.user_id))
          if (profileDoc.exists()) {
            const profile = profileDoc.data()
            reservation.profiles = {
              full_name: profile.full_name,
              email: profile.email
            }
          }
        }
        
        reservations.push(reservation)
      }
      
      return { data: reservations, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async createReservation(reservationData) {
    try {
      // Vérifier si le véhicule est disponible
      const vehicleDoc = await getDoc(doc(this.db, 'vehicles', reservationData.vehicle_id))
      if (!vehicleDoc.exists()) {
        throw new Error('Véhicule non trouvé')
      }
      
      const vehicle = vehicleDoc.data()
      if (vehicle.status !== 'available') {
        throw new Error('Ce véhicule n\'est pas disponible')
      }
      
      // Créer la réservation
      const resRef = await addDoc(collection(this.db, 'reservations'), {
        ...reservationData,
        status: 'pending',
        created_at: Timestamp.now()
      })
      
      // Mettre à jour le statut du véhicule
      await updateDoc(doc(this.db, 'vehicles', reservationData.vehicle_id), {
        status: 'reserved',
        updated_at: Timestamp.now()
      })
      
      const resDoc = await getDoc(resRef)
      const reservation = { id: resDoc.id, ...resDoc.data() }
      
      // Charger les relations
      const vehicleData = vehicleDoc.data()
      reservation.vehicles = {
        plate_number: vehicleData.plate_number,
        brand: vehicleData.brand,
        model: vehicleData.model,
        type: vehicleData.type
      }
      
      const profileDoc = await getDoc(doc(this.db, 'profiles', reservation.user_id))
      if (profileDoc.exists()) {
        const profile = profileDoc.data()
        reservation.profiles = {
          full_name: profile.full_name,
          email: profile.email
        }
      }
      
      return { data: reservation, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateReservation(reservationId, updates) {
    try {
      const resRef = doc(this.db, 'reservations', reservationId)
      await updateDoc(resRef, {
        ...updates,
        updated_at: Timestamp.now()
      })
      
      const resDoc = await getDoc(resRef)
      const reservation = { id: resDoc.id, ...resDoc.data() }
      
      // Charger les relations
      if (reservation.vehicle_id) {
        const vehicleDoc = await getDoc(doc(this.db, 'vehicles', reservation.vehicle_id))
        if (vehicleDoc.exists()) {
          const vehicle = vehicleDoc.data()
          reservation.vehicles = {
            plate_number: vehicle.plate_number,
            brand: vehicle.brand,
            model: vehicle.model,
            type: vehicle.type
          }
        }
      }
      
      if (reservation.user_id) {
        const profileDoc = await getDoc(doc(this.db, 'profiles', reservation.user_id))
        if (profileDoc.exists()) {
          const profile = profileDoc.data()
          reservation.profiles = {
            full_name: profile.full_name,
            email: profile.email
          }
        }
      }
      
      return { data: reservation, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // ========== TRAJETS ==========
  
  async getTrips(filters = {}) {
    try {
      let q = collection(this.db, 'trips')
      q = query(q, orderBy('date_heure_depart', 'desc'))
      
      if (filters.user_id) {
        q = query(q, where('conducteur_id', '==', filters.user_id))
      }
      
      const snapshot = await getDocs(q)
      const trips = []
      
      for (const tripDoc of snapshot.docs) {
        const trip = { id: tripDoc.id, ...tripDoc.data() }
        
        // Charger le véhicule
        if (trip.vehicule_id) {
          const vehicleDoc = await getDoc(doc(this.db, 'vehicles', trip.vehicule_id))
          if (vehicleDoc.exists()) {
            const vehicle = vehicleDoc.data()
            trip.vehicle_nom = `${vehicle.brand} ${vehicle.model}`
          }
        }
        
        trips.push(trip)
      }
      
      return { data: trips, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async createTrip(tripData) {
    try {
      const tripRef = await addDoc(collection(this.db, 'trips'), {
        ...tripData,
        created_at: Timestamp.now()
      })
      
      // Mettre à jour le statut du véhicule
      await updateDoc(doc(this.db, 'vehicles', tripData.vehicule_id), {
        status: 'reserve',
        updated_at: Timestamp.now()
      })
      
      const tripDoc = await getDoc(tripRef)
      return { data: { id: tripDoc.id, ...tripDoc.data() }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateTrip(tripId, updates) {
    try {
      const tripRef = doc(this.db, 'trips', tripId)
      await updateDoc(tripRef, {
        ...updates,
        updated_at: Timestamp.now()
      })
      
      const tripDoc = await getDoc(tripRef)
      return { data: { id: tripDoc.id, ...tripDoc.data() }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // ========== MAINTENANCES ==========
  
  async getMaintenances(filters = {}) {
    try {
      let q = collection(this.db, 'maintenances')
      q = query(q, orderBy('date_prevue', 'asc'))
      
      if (filters.vehicle_id) {
        q = query(q, where('vehicle_id', '==', filters.vehicle_id))
      }
      
      const snapshot = await getDocs(q)
      const maintenances = []
      
      for (const maintDoc of snapshot.docs) {
        const maintenance = { id: maintDoc.id, ...maintDoc.data() }
        
        // Charger le véhicule
        if (maintenance.vehicle_id) {
          const vehicleDoc = await getDoc(doc(this.db, 'vehicles', maintenance.vehicle_id))
          if (vehicleDoc.exists()) {
            const vehicle = vehicleDoc.data()
            maintenance.vehicle_name = `${vehicle.brand} ${vehicle.model}`
          }
        }
        
        maintenances.push(maintenance)
      }
      
      return { data: maintenances, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // ========== DÉPARTEMENTS ==========
  
  async getDepartments() {
    try {
      const snapshot = await getDocs(query(collection(this.db, 'departments'), orderBy('name')))
      const departments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return { data: departments, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateProfile(profileId, updates) {
    try {
      const profileRef = doc(this.db, 'profiles', profileId)
      await updateDoc(profileRef, {
        ...updates,
        updated_at: Timestamp.now()
      })
      
      const profileDoc = await getDoc(profileRef)
      const profile = { id: profileDoc.id, ...profileDoc.data() }
      
      // Charger le département
      if (profile.department_id) {
        const deptDoc = await getDoc(doc(this.db, 'departments', profile.department_id))
        if (deptDoc.exists()) {
          profile.department_name = deptDoc.data().name
        }
      }
      
      return { data: profile, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // ========== SYNCHRONISATION TEMPS RÉEL ==========
  
  /**
   * S'abonner aux changements de véhicules en temps réel
   * @param {Function} callback - Fonction appelée à chaque changement
   * @returns {Function} Fonction pour se désabonner
   */
  subscribeToVehicles(callback) {
    const q = query(collection(this.db, 'vehicles'), orderBy('brand'), orderBy('model'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const vehicle = { id: change.doc.id, ...change.doc.data() }
        callback({
          eventType: change.type, // 'added', 'modified', 'removed'
          new: change.type !== 'removed' ? vehicle : null,
          old: change.type === 'removed' ? vehicle : null
        })
      })
    })
    
    return unsubscribe
  }

  /**
   * S'abonner aux changements de réservations en temps réel
   * @param {Function} callback - Fonction appelée à chaque changement
   * @returns {Function} Fonction pour se désabonner
   */
  subscribeToReservations(callback) {
    const q = query(collection(this.db, 'reservations'), orderBy('created_at', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const reservation = { id: change.doc.id, ...change.doc.data() }
        callback({
          eventType: change.type,
          new: change.type !== 'removed' ? reservation : null,
          old: change.type === 'removed' ? reservation : null
        })
      })
    })
    
    return unsubscribe
  }

  /**
   * S'abonner aux changements de trajets en temps réel
   * @param {Function} callback - Fonction appelée à chaque changement
   * @returns {Function} Fonction pour se désabonner
   */
  subscribeToTrips(callback) {
    const q = query(collection(this.db, 'trips'), orderBy('date_heure_depart', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const trip = { id: change.doc.id, ...change.doc.data() }
        callback({
          eventType: change.type,
          new: change.type !== 'removed' ? trip : null,
          old: change.type === 'removed' ? trip : null
        })
      })
    })
    
    return unsubscribe
  }
}
