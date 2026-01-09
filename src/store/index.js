import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'

export const useAuthStore = defineStore('auth', () => {
  // Mode développement : désactive l'authentification pour les tests
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
  
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // En mode dev, créer un utilisateur fictif
  if (DEV_MODE && !user.value) {
    user.value = {
      id: 'dev-user-123',
      email: 'dev@test.local',
      full_name: 'Utilisateur Test',
      role: 'admin',
      department_id: '11111111-1111-1111-1111-111111111111',
      department_name: 'Alpes-de-Haute-Provence'
    }
    console.log('🔧 Mode développement activé - Authentification désactivée')
  }

  const isAuthenticated = computed(() => {
    if (DEV_MODE) return true // Toujours authentifié en mode dev
    return !!user.value
  })
  const isAdmin = computed(() => {
    if (DEV_MODE) return true // Toujours admin en mode dev
    return user.value?.role === 'admin'
  })

  async function loadUserProfile() {
    if (!user.value) return;
    
    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!currentUser) throw new Error('Utilisateur non connecté');
      
      // Vérifier si le profil existe
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Erreur lors de la recherche du profil:', profileError);
        throw profileError;
      }
      
      if (!profile) {
        // Créer le profil s'il n'existe pas
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || currentUser.email,
            email: currentUser.email,
            role: 'user'
          })
          .select('*')
          .single();
        
        if (createError) throw createError;
        
        user.value = {
          ...currentUser,
          ...newProfile
        };
        return;
      }
      
      // Charger le département si disponible
      let department = null;
      if (profile.department_id) {
        const { data: deptData } = await supabase
          .from('departments')
          .select('*')
          .eq('id', profile.department_id)
          .maybeSingle();
        department = deptData;
      }
      
      user.value = {
        ...currentUser,
        ...profile,
        department_name: department?.name || null
      };
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
      throw err;
    }
  }

  async function checkAuth() {
    // En mode dev, retourner directement l'utilisateur fictif
    if (DEV_MODE) {
      return { user: user.value, error: null };
    }
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (session?.user) {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (currentUser) {
          user.value = currentUser;
          await loadUserProfile();
        }
      }
      
      return { user: user.value, error: null };
    } catch (err) {
      if (err.message !== 'Auth session missing!') {
        console.error('Erreur de vérification de l\'authentification:', err);
      }
      return { user: null, error: err };
    }
  }

  async function signIn(email, password) {
    try {
      isLoading.value = true;
      error.value = null;
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) throw signInError;
      
      await loadUserProfile();
      return { user: user.value, error: null };
    } catch (err) {
      console.error('Erreur de connexion:', err);
      error.value = err.message;
      return { user: null, error: err };
    } finally {
      isLoading.value = false;
    }
  }

  async function signUp(email, password, userData) {
    try {
      isLoading.value = true;
      error.value = null;
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            role: 'user'
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Échec de la création de l\'utilisateur');

      // Créer le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: userData.fullName,
          email: email,
          role: 'user'
        })
        .select('*')
        .single();

      if (profileError) throw profileError;

      user.value = {
        ...data.user,
        ...profile
      };
      
      return { user: user.value, error: null };
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
      error.value = err.message;
      return { user: null, error: err };
    } finally {
      isLoading.value = false;
    }
  }

  async function signOut() {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      user.value = null;
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      error.value = err.message;
      return { error: err };
    }
  }

  async function updateProfile(profileData) {
    try {
      if (!user.value) throw new Error('Utilisateur non connecté');
      
      isLoading.value = true;
      error.value = null;
      
      // Mettre à jour les données d'authentification
      const { data: authData, error: updateAuthError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name
        }
      });
      
      if (updateAuthError) throw updateAuthError;
      
      // Mettre à jour le profil
      const { data: profile, error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          role: profileData.role || 'user',
          department_id: profileData.department_id || null
        })
        .eq('id', user.value.id)
        .select('*')
        .single();
      
      if (updateProfileError) throw updateProfileError;
      
      // Charger les informations du département
      let department = null;
      if (profile.department_id) {
        const { data: deptData } = await supabase
          .from('departments')
          .select('*')
          .eq('id', profile.department_id)
          .single();
        department = deptData;
      }
      
      user.value = {
        ...user.value,
        ...profile,
        department_name: department?.name || null
      };
      
      return { user: user.value, error: null };
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      error.value = err.message;
      return { error: err };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateDepartment(departmentId) {
    try {
      if (!user.value) throw new Error('Utilisateur non connecté');
      
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!currentUser) throw new Error('Utilisateur non authentifié');

      // Vérifier si le département existe
      const { data: department, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .eq('id', departmentId)
        .maybeSingle();
      
      if (deptError || !department) {
        throw new Error('Département invalide');
      }
      
      // Mettre à jour le profil
      const { data: profile, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          department_id: departmentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id)
        .select('*')
        .maybeSingle();
      
      if (updateError) throw updateError;
      if (!profile) throw new Error('Impossible de mettre à jour le profil');
      
      // Mettre à jour l'utilisateur localement
      user.value = {
        ...user.value,
        ...profile,
        department_name: department.name
      };
      
      return { success: true, profile };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du département:', error);
      throw error;
    }
  }

  async function initializeApp() {
    // En mode dev, ne pas initialiser Supabase
    if (DEV_MODE) {
      console.log('🔧 Mode dev : Initialisation Supabase ignorée');
      return;
    }
    
    try {
      // Vérifier si la table departments est vide
      const { data: departments, error } = await supabase
        .from('departments')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      if (!departments || departments.length === 0) {
        // Insérer les départements si la table est vide
        const { error: insertError } = await supabase
          .from('departments')
          .insert([
            { id: '11111111-1111-1111-1111-111111111111', name: 'Alpes-de-Haute-Provence', code: '04' },
            { id: '22222222-2222-2222-2222-222222222222', name: 'Hautes-Alpes', code: '05' },
            { id: '33333333-3333-3333-3333-333333333333', name: 'Alpes-Maritimes', code: '06' },
            { id: '44444444-4444-4444-4444-444444444444', name: 'Bouches-du-Rhône', code: '13' },
            { id: '55555555-5555-5555-5555-555555555555', name: 'Var', code: '83' },
            { id: '66666666-6666-6666-6666-666666666666', name: 'Vaucluse', code: '84' }
          ]);
        
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'application:', error);
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    signIn,
    signUp,
    signOut,
    checkAuth,
    loadUserProfile,
    updateProfile,
    updateDepartment,
    initializeApp
  };
});