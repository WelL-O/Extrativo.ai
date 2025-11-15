/**
 * EXTRATIVO.AI - AUTH PROVIDER
 * Provider global de autenticação com Context API
 */

'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/lib/supabase-front/hooks/useAuth'
import type { User, AuthError, Session } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase-front/types'

type UserProfile = Database['public']['Tables']['profiles']['Row']

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: AuthError | null
  signUp: ReturnType<typeof useAuth>['signUp']
  signUpWithOtp: ReturnType<typeof useAuth>['signUpWithOtp']
  signIn: ReturnType<typeof useAuth>['signIn']
  signInWithOtp: ReturnType<typeof useAuth>['signInWithOtp']
  verifyOtp: ReturnType<typeof useAuth>['verifyOtp']
  resendOtp: ReturnType<typeof useAuth>['resendOtp']
  signOut: ReturnType<typeof useAuth>['signOut']
  resetPassword: ReturnType<typeof useAuth>['resetPassword']
  updatePassword: ReturnType<typeof useAuth>['updatePassword']
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// Hook para usar o contexto de autenticação
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Hook auxiliar para verificar se está autenticado
export function useIsAuthenticated() {
  const { user, loading } = useAuthContext()
  return { isAuthenticated: !!user, loading }
}

// Hook auxiliar para pegar usuário atual
export function useCurrentUser() {
  const { user, profile, loading } = useAuthContext()
  return { user, profile, loading }
}

// HOC para proteger rotas
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo = '/login'
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useIsAuthenticated()

    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      )
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo
      }
      return null
    }

    return <Component {...props} />
  }
}
