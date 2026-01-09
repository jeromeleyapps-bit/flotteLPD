import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!')
  console.error('Veuillez créer un fichier .env avec:')
  console.error('VITE_SUPABASE_URL=votre_url_supabase')
  console.error('VITE_SUPABASE_ANON_KEY=votre_cle_anon')
  throw new Error('Les variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définies')
}

// Vérifier que l'URL est valide
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('❌ URL Supabase invalide:', supabaseUrl)
  console.error('L\'URL doit commencer par https:// et contenir .supabase.co')
  throw new Error('URL Supabase invalide. Vérifiez votre fichier .env')
}

// En mode dev, désactiver le rafraîchissement automatique des tokens
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: !DEV_MODE, // Désactiver en mode dev pour éviter les erreurs
    persistSession: !DEV_MODE, // Désactiver la persistance en mode dev
    detectSessionInUrl: !DEV_MODE // Désactiver la détection en mode dev
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': supabaseAnonKey
    }
  }
})

// Wrapper pour compatibilité avec l'ancien code qui utilise 'db'
// Note: Ce wrapper est une solution temporaire. Il est recommandé d'utiliser directement 'supabase'
export const db = {
  // Méthodes pour les véhicules
  async getVehicles() {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
      return { data, error }
    } catch (err) {
      console.error('Erreur lors de la récupération des véhicules:', err)
      return { data: null, error: err }
    }
  },

  // Méthodes pour les trajets
  async getTrips() {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('date_heure_depart', { ascending: false })
      return { data, error }
    } catch (err) {
      console.error('Erreur lors de la récupération des trajets:', err)
      return { data: null, error: err }
    }
  },

  async createTrip(tripData) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert(tripData)
        .select()
        .single()
      return { data, error }
    } catch (err) {
      console.error('Erreur lors de la création du trajet:', err)
      return { data: null, error: err }
    }
  },

  async updateTrip(tripId, updates) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', tripId)
        .select()
        .single()
      return { data, error }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du trajet:', err)
      return { data: null, error: err }
    }
  },

  // Méthodes pour les maintenances
  async getMaintenances() {
    try {
      const { data, error } = await supabase
        .from('maintenances')
        .select('*')
        .order('date_prevue', { ascending: true })
      return { data, error }
    } catch (err) {
      console.error('Erreur lors de la récupération des maintenances:', err)
      return { data: null, error: err }
    }
  },

  // Méthodes pour les véhicules
  async updateVehicle(vehicleId, updates) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', vehicleId)
        .select()
        .single()
      return { data, error }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du véhicule:', err)
      return { data: null, error: err }
    }
  }
}