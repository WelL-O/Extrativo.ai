/**
 * EXTRATIVO.AI - SUPABASE CLIENT
 * Cliente Supabase configurado e tipado para Next.js
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase-front/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Durante o build, as variáveis podem não estar disponíveis
// Usamos valores placeholder que serão substituídos no runtime
const isBuildTime = typeof window === 'undefined' && !supabaseUrl

export const supabase = createClient<Database>(
  isBuildTime ? 'https://placeholder.supabase.co' : supabaseUrl,
  isBuildTime ? 'placeholder-key' : supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'extrativo-auth',
    },
  }
)

export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession()
  return session !== null
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
