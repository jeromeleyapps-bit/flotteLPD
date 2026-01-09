import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/safety',
    name: 'safety',
    component: () => import('@/views/SafetyNoticeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/vehicles',
    name: 'vehicles',
    component: () => import('@/views/vehicles/VehiclesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/select-department',
    name: 'select-department',
    component: () => import('@/views/DepartmentSelect.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reservations',
    name: 'reservations',
    component: () => import('@/views/reservations/ReservationListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reservations/create',
    name: 'create-reservation',
    component: () => import('@/views/reservations/ReservationForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reservations/:id',
    name: 'reservation-detail',
    component: () => import('@/views/reservations/ReservationDetail.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/reservations/:id/edit',
    name: 'edit-reservation',
    component: () => import('@/views/reservations/ReservationForm.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/trips',
    name: 'trips',
    component: () => import('@/views/TripManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Garde de navigation
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
  
  // En mode dev, ignorer toutes les vérifications d'authentification
  if (DEV_MODE) {
    await authStore.checkAuth() // Initialiser l'utilisateur fictif
    return next() // Laisser passer toutes les routes
  }
  
  // Vérifier l'authentification
  await authStore.checkAuth()
  
  // Si la route nécessite une authentification
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }
  
  // Si l'utilisateur est connecté mais n'a pas sélectionné de département
  if (authStore.isAuthenticated && 
      to.name !== 'select-department' && 
      to.name !== 'logout' &&
      !authStore.user?.department_id) {
    return next('/select-department')
  }
  
  // Rediriger vers le tableau de bord si l'utilisateur est déjà connecté
  if ((to.name === 'login' || to.name === 'register' || to.name === 'home') && 
      authStore.isAuthenticated) {
    // En mode dev, rediriger vers dashboard, sinon vers safety
    if (DEV_MODE) {
      return next('/dashboard')
    }
    return next('/safety')
  }
  
  if (to.name === 'safety' && !authStore.user?.department_id) {
    return next('/select-department')
  }
  
  next()
})

export default router