/**
 * EXTRATIVO.AI - AUTHENTICATION HOOK
 * Hook customizado para autenticação com Supabase incluindo suporte a OTP
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-front/client/supabase'
import type { User, AuthError, Session } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase-front/types'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

interface SignUpData {
  email: string
  password: string
  fullName?: string
}

interface SignInData {
  email: string
  password: string
}

interface VerifyOtpData {
  email: string
  token: string
  type?: 'email' | 'signup' | 'sms' | 'phone_change' | 'email_change' | 'recovery'
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  })

  // Inicializa sessão e observa mudanças
  useEffect(() => {
    // Pega sessão inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setAuthState(prev => ({ ...prev, error, loading: false }))
        return
      }

      if (session?.user) {
        loadUserProfile(session.user.id, session)
      } else {
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    })

    // Observa mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session)
      } else {
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: null,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Carrega perfil do usuário
  const loadUserProfile = async (userId: string, session: Session) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      setAuthState({
        user: session.user,
        profile,
        session,
        loading: false,
        error: null,
      })
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        user: session.user,
        session,
        loading: false,
        error: error as AuthError,
      }))
    }
  }

  // Sign up com email/password (envia link de confirmação)
  const signUp = async ({ email, password, fullName }: SignUpData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      // NOTA: A criação do perfil será feita via trigger no Supabase
      // ou você precisa configurar RLS policies antes
      // Comentado temporariamente para permitir signup sem erro de RLS
      /*
      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName || null,
        })

        if (profileError) throw profileError
      }
      */

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { data: null, error: authError }
    }
  }

  // Sign up com Magic Link (link de confirmação via email)
  const signUpWithOtp = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      // Envia magic link para o email
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { data: null, error: authError }
    }
  }

  // Sign in com email/password
  const signIn = async ({ email, password }: SignInData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { data: null, error: authError }
    }
  }

  // Sign in com OTP
  const signInWithOtp = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      // IMPORTANTE: Não usar emailRedirectTo para enviar código OTP
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Removido emailRedirectTo para enviar código OTP em vez de magic link
        },
      })

      if (error) throw error

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { data: null, error: authError }
    }
  }

  // Verifica código OTP
  const verifyOtp = async ({ email, token, type = 'email' }: VerifyOtpData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      })

      if (error) throw error

      // Se tem usuário criado, verifica se precisa criar perfil
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single()

        // Se não existe perfil, cria
        if (profileError) {
          await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email!,
          })
        }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { data: null, error: authError }
    }
  }

  // Reenvia código OTP
  const resendOtp = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      // Reenvia o código OTP
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Não cria usuário novo, só reenvia
        },
      })

      if (error) throw error

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { data: null, error: authError }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: null,
      })

      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { error: authError }
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { data: null, error: authError }
    }
  }

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { data: null, error: authError }
    }
  }

  return {
    ...authState,
    signUp,
    signUpWithOtp,
    signIn,
    signInWithOtp,
    verifyOtp,
    resendOtp,
    signOut,
    resetPassword,
    updatePassword,
  }
}
