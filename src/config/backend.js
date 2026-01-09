/**
 * Configuration du backend
 * Changez VITE_BACKEND_TYPE pour utiliser un autre backend
 * 
 * Options disponibles :
 * - 'localstorage' : Stockage local (fonctionne immédiatement, pas de serveur)
 * - 'supabase' : Supabase (nécessite configuration)
 * - 'firebase' : Firebase (nécessite configuration)
 * - 'pocketbase' : PocketBase (nécessite serveur)
 * - 'rest' : API REST personnalisée (nécessite serveur)
 */

const BACKEND_TYPE = import.meta.env.VITE_BACKEND_TYPE || 'localstorage'

let backendAdapter = null

// Charger dynamiquement l'adaptateur selon la configuration
async function loadBackendAdapter() {
  if (backendAdapter) return backendAdapter

  try {
    switch (BACKEND_TYPE) {
      case 'localstorage':
        const { LocalStorageAdapter } = await import('./adapters/localstorage.js')
        backendAdapter = new LocalStorageAdapter()
        console.log('✅ Backend: LocalStorage (mode local)')
        break
      
      case 'supabase':
        const { SupabaseAdapter } = await import('./adapters/supabase.js')
        backendAdapter = new SupabaseAdapter()
        console.log('✅ Backend: Supabase')
        break
      
      case 'firebase':
        const { FirebaseAdapter } = await import('./adapters/firebase.js')
        backendAdapter = new FirebaseAdapter()
        console.log('✅ Backend: Firebase')
        break
      
      case 'pocketbase':
        // const { PocketBaseAdapter } = await import('./adapters/pocketbase.js')
        // backendAdapter = new PocketBaseAdapter()
        // console.log('✅ Backend: PocketBase')
        console.warn('⚠️ PocketBase non encore implémenté, utilisation de LocalStorage')
        const { LocalStorageAdapter: PocketBaseFallback } = await import('./adapters/localstorage.js')
        backendAdapter = new PocketBaseFallback()
        break
      
      case 'rest':
        // const { RestAdapter } = await import('./adapters/rest.js')
        // backendAdapter = new RestAdapter()
        // console.log('✅ Backend: REST API')
        console.warn('⚠️ REST API non encore implémenté, utilisation de LocalStorage')
        const { LocalStorageAdapter: RestFallback } = await import('./adapters/localstorage.js')
        backendAdapter = new RestFallback()
        break
      
      default:
        console.warn(`⚠️ Backend type "${BACKEND_TYPE}" inconnu, utilisation de LocalStorage par défaut`)
        const { LocalStorageAdapter: DefaultAdapter } = await import('./adapters/localstorage.js')
        backendAdapter = new DefaultAdapter()
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement de l\'adaptateur backend:', error)
    // Fallback vers LocalStorage en cas d'erreur
    const { LocalStorageAdapter: FallbackAdapter } = await import('./adapters/localstorage.js')
    backendAdapter = new FallbackAdapter()
    console.log('✅ Fallback: LocalStorage')
  }

  return backendAdapter
}

// Fonction pour obtenir le backend (peut être appelée de manière synchrone après initialisation)
export async function getBackend() {
  if (!backendAdapter) {
    await loadBackendAdapter()
  }
  return backendAdapter
}

// Initialiser le backend (pour utilisation directe)
let backendPromise = null
export const backend = (async () => {
  if (!backendPromise) {
    backendPromise = loadBackendAdapter()
  }
  return await backendPromise
})()

// Export pour utilisation dans les stores
export default backend
