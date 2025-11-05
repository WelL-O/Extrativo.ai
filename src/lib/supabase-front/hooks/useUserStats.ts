/**
 * EXTRATIVO - USER STATS HOOK
 * Hook para buscar estatísticas do usuário
 */

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase-front/client/supabase'

interface UserStats {
  total_extractions: number
  total_leads: number
  total_projects: number
  searches_used: number
  searches_remaining: number
  plan: string
}

interface UseUserStatsReturn {
  stats: UserStats | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

export function useUserStats(userId?: string): UseUserStatsReturn {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const lastUserIdRef = useRef<string | undefined>(undefined)
  const isLoadingRef = useRef(false)

  const loadStats = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Evita carregamento duplicado se já estiver carregando
    if (isLoadingRef.current) {
      console.log('[useUserStats] Já está carregando, ignorando chamada duplicada')
      return
    }

    try {
      isLoadingRef.current = true
      setLoading(true)
      setError(null)
      console.log('[useUserStats] Carregando estatísticas para:', userId)

      const { data, error: rpcError } = await supabase.rpc('get_user_stats', {
        p_user_id: userId,
      })

      if (rpcError) throw rpcError

      // A função retorna um array, pegamos o primeiro item
      if (data && data.length > 0) {
        setStats(data[0] as UserStats)
      } else {
        // Se não houver dados, retorna valores padrão
        setStats({
          total_extractions: 0,
          total_leads: 0,
          total_projects: 0,
          searches_used: 0,
          searches_remaining: 0,
          plan: 'free',
        })
      }
      console.log('[useUserStats] Estatísticas carregadas com sucesso')
    } catch (err) {
      setError(err as Error)
      console.error('[useUserStats] Erro ao carregar estatísticas:', err)
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }

  useEffect(() => {
    // Só recarrega se o userId realmente mudou
    if (userId !== lastUserIdRef.current) {
      console.log('[useUserStats] userId mudou de', lastUserIdRef.current, 'para', userId)
      lastUserIdRef.current = userId
      loadStats()
    } else if (userId) {
      console.log('[useUserStats] userId não mudou, pulando recarga')
    }
  }, [userId])

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  }
}
