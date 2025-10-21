/**
 * EXTRATIVO.AI - SUPABASE FRONTEND
 * Exportações centralizadas do módulo supabase-front
 */

// Client
export { supabase, isAuthenticated, getCurrentUser, signOut } from './client/supabase'

// Hooks
export { useAuth } from './hooks/useAuth'
export { useExtractions } from './hooks/useExtractions'
export { useUser } from './hooks/useUser'

// Providers
export {
  AuthProvider,
  useAuthContext,
  useIsAuthenticated,
  useCurrentUser,
  withAuth,
} from './providers/AuthProvider'

// Utils
export * from './utils/supabase-helpers'

// Types
export type { Database } from './types/database.types'
