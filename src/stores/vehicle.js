import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'

export const useVehicleStore = defineStore('vehicle', () => {
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
  
  const vehicles = ref([])
  const loading = ref(false)
  const error = ref(null)

  const availableVehicles = computed(() => 
    vehicles.value.filter(v => v.status === 'available')
  )

  const vehiclesByDepartment = computed(() => (departmentId) => 
    vehicles.value.filter(v => v.department_id === departmentId)
  )

  // Données fictives pour le mode dev
  const mockVehicles = [
    {
      id: 'dev-vehicle-1',
      plate_number: 'AA-123-AA',
      brand: 'Renault',
      model: 'Dokker',
      year: 2020,
      type: 'utilitaire',
      fuel_type: 'diesel',
      status: 'available',
      department_id: '11111111-1111-1111-1111-111111111111',
      department_name: 'Alpes-de-Haute-Provence',
      department_code: '04',
      created_at: new Date().toISOString()
    },
    {
      id: 'dev-vehicle-2',
      plate_number: 'BB-456-BB',
      brand: 'Dacia',
      model: 'Logan',
      year: 2021,
      type: 'voiture',
      fuel_type: 'essence',
      status: 'available',
      department_id: '11111111-1111-1111-1111-111111111111',
      department_name: 'Alpes-de-Haute-Provence',
      department_code: '04',
      created_at: new Date().toISOString()
    },
    {
      id: 'dev-vehicle-3',
      plate_number: 'CC-789-CC',
      brand: 'Ford',
      model: 'Transit',
      year: 2019,
      type: 'utilitaire',
      fuel_type: 'diesel',
      status: 'maintenance',
      department_id: '11111111-1111-1111-1111-111111111111',
      department_name: 'Alpes-de-Haute-Provence',
      department_code: '04',
      created_at: new Date().toISOString()
    }
  ]

  async function loadVehicles(departmentId = null) {
    try {
      loading.value = true
      error.value = null
      
      // En mode dev, retourner des données fictives
      if (DEV_MODE) {
        console.log('🔧 Mode dev : Chargement de véhicules fictifs')
        await new Promise(resolve => setTimeout(resolve, 300)) // Simuler un délai réseau
        
        let mockData = [...mockVehicles]
        if (departmentId) {
          mockData = mockData.filter(v => v.department_id === departmentId)
        }
        
        vehicles.value = mockData
        return
      }
      
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          departments (
            name,
            code
          )
        `)
      
      if (departmentId) {
        query = query.eq('department_id', departmentId)
      }
      
      const { data, error: fetchError } = await query.order('brand, model')
      
      if (fetchError) throw fetchError
      
      vehicles.value = data.map(vehicle => ({
        ...vehicle,
        department_name: vehicle.departments?.name || 'Non assigné',
        department_code: vehicle.departments?.code || ''
      }))
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addVehicle(vehicleData) {
    try {
      loading.value = true
      error.value = null
      
      // En mode dev, simuler l'ajout
      if (DEV_MODE) {
        console.log('🔧 Mode dev : Ajout de véhicule fictif')
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const newVehicle = {
          id: `dev-vehicle-${Date.now()}`,
          ...vehicleData,
          status: 'available',
          department_name: 'Alpes-de-Haute-Provence',
          department_code: '04',
          created_at: new Date().toISOString()
        }
        
        vehicles.value.push(newVehicle)
        return newVehicle
      }
      
      const { data, error: insertError } = await supabase
        .from('vehicles')
        .insert({
          ...vehicleData,
          status: 'available'
        })
        .select(`
          *,
          departments (
            name,
            code
          )
        `)
        .single()
      
      if (insertError) throw insertError
      
      const newVehicle = {
        ...data,
        department_name: data.departments?.name || 'Non assigné',
        department_code: data.departments?.code || ''
      }
      
      vehicles.value.push(newVehicle)
      return newVehicle
    } catch (err) {
      console.error('Erreur lors de l\'ajout du véhicule:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateVehicle(vehicleId, updates) {
    try {
      loading.value = true
      error.value = null
      
      // En mode dev, simuler la mise à jour
      if (DEV_MODE) {
        console.log('🔧 Mode dev : Mise à jour de véhicule fictif')
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const index = vehicles.value.findIndex(v => v.id === vehicleId)
        if (index !== -1) {
          vehicles.value[index] = {
            ...vehicles.value[index],
            ...updates,
            updated_at: new Date().toISOString()
          }
          return vehicles.value[index]
        }
        throw new Error('Véhicule non trouvé')
      }
      
      const { data, error: updateError } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', vehicleId)
        .select(`
          *,
          departments (
            name,
            code
          )
        `)
        .single()
      
      if (updateError) throw updateError
      
      const index = vehicles.value.findIndex(v => v.id === vehicleId)
      if (index !== -1) {
        vehicles.value[index] = {
          ...data,
          department_name: data.departments?.name || 'Non assigné',
          department_code: data.departments?.code || ''
        }
      }
      
      return data
    } catch (err) {
      console.error('Erreur lors de la mise à jour du véhicule:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteVehicle(vehicleId) {
    try {
      loading.value = true
      error.value = null
      
      // En mode dev, simuler la suppression
      if (DEV_MODE) {
        console.log('🔧 Mode dev : Suppression de véhicule fictif')
        await new Promise(resolve => setTimeout(resolve, 300))
        vehicles.value = vehicles.value.filter(v => v.id !== vehicleId)
        return
      }
      
      const { error: deleteError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)
      
      if (deleteError) throw deleteError
      
      vehicles.value = vehicles.value.filter(v => v.id !== vehicleId)
    } catch (err) {
      console.error('Erreur lors de la suppression du véhicule:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateVehicleStatus(vehicleId, status) {
    return await updateVehicle(vehicleId, { 
      status,
      updated_at: new Date().toISOString()
    })
  }

  function getVehicleById(vehicleId) {
    return vehicles.value.find(v => v.id === vehicleId)
  }

  return {
    vehicles,
    loading,
    error,
    availableVehicles,
    vehiclesByDepartment,
    loadVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    updateVehicleStatus,
    getVehicleById
  }
})
