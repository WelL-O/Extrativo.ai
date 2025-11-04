/**
 * EXTRATIVO - CURRENT USER HOOK
 * Hook simplificado para acessar o usuário autenticado atual
 */

import { useAuth } from './useAuth'

export function useCurrentUser() {
  const { user, profile, loading, error } = useAuth()

  return {
    user,
    profile,
    loading,
    error,
  }
}
