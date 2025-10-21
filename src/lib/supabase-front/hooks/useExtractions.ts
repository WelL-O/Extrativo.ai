/**
 * EXTRATIVO.AI - EXTRACTIONS HOOK
 * Hook para gerenciar extrações com realtime e suporte a download
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-front/client/supabase'
import type { Database } from '@/lib/supabase-front/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

type Extraction = Database['public']['Tables']['extractions']['Row']
type ExtractionResult = Database['public']['Tables']['extraction_results']['Row']
type ExtractionInsert = Database['public']['Tables']['extractions']['Insert']
type ExtractionUpdate = Database['public']['Tables']['extractions']['Update']

interface ExtractionsState {
  extractions: Extraction[]
  loading: boolean
  error: Error | null
}

interface UseExtractionsOptions {
  userId?: string
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealtime?: boolean
}

export function useExtractions(options: UseExtractionsOptions = {}) {
  const {
    userId,
    autoRefresh = false,
    refreshInterval = 30000,
    enableRealtime = true,
  } = options

  const [state, setState] = useState<ExtractionsState>({
    extractions: [],
    loading: true,
    error: null,
  })

  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null)

  // Carrega extrações
  const loadExtractions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      let query = supabase
        .from('extractions')
        .select('*')
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error

      setState({
        extractions: data || [],
        loading: false,
        error: null,
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }))
    }
  }

  // Cria nova extração
  const createExtraction = async (extraction: ExtractionInsert) => {
    try {
      const { data, error } = await supabase
        .from('extractions')
        .insert(extraction)
        .select()
        .single()

      if (error) throw error

      // Atualiza lista local
      setState(prev => ({
        ...prev,
        extractions: [data, ...prev.extractions],
      }))

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Atualiza extração
  const updateExtraction = async (id: string, updates: ExtractionUpdate) => {
    try {
      const { data, error } = await supabase
        .from('extractions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Atualiza lista local
      setState(prev => ({
        ...prev,
        extractions: prev.extractions.map(e => (e.id === id ? data : e)),
      }))

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Deleta extração
  const deleteExtraction = async (id: string) => {
    try {
      const { error } = await supabase.from('extractions').delete().eq('id', id)

      if (error) throw error

      // Atualiza lista local
      setState(prev => ({
        ...prev,
        extractions: prev.extractions.filter(e => e.id !== id),
      }))

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Busca resultados de uma extração
  const getExtractionResults = async (extractionId: string) => {
    try {
      const { data, error } = await supabase
        .from('extraction_results')
        .select('*')
        .eq('extraction_id', extractionId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Download CSV dos resultados
  const downloadResultsCSV = async (extractionId: string) => {
    try {
      const { data: results, error } = await getExtractionResults(extractionId)

      if (error || !results) throw error

      // Converte para CSV
      const headers = ['ID', 'Data', 'URL', 'Dados Extraídos', 'Status']
      const rows = results.map((r: ExtractionResult) => [
        r.id,
        new Date(r.created_at).toLocaleString('pt-BR'),
        r.source_url || '',
        JSON.stringify(r.extracted_data),
        r.error_message || 'Sucesso',
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n')

      // Cria download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `extraction_${extractionId}_results.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Busca extração por ID
  const getExtraction = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('extractions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Cancela extração em andamento
  const cancelExtraction = async (id: string) => {
    return updateExtraction(id, { status: 'cancelled' })
  }

  // Reprocessa extração falhada
  const retryExtraction = async (id: string) => {
    return updateExtraction(id, {
      status: 'pending',
      error_message: null,
      started_at: null,
      completed_at: null,
    })
  }

  // Effect: Carregamento inicial
  useEffect(() => {
    loadExtractions()
  }, [userId])

  // Effect: Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(loadExtractions, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, userId])

  // Effect: Realtime
  useEffect(() => {
    if (!enableRealtime) return

    const channel = supabase
      .channel('extractions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'extractions',
          filter: userId ? `user_id=eq.${userId}` : undefined,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setState(prev => ({
              ...prev,
              extractions: [payload.new as Extraction, ...prev.extractions],
            }))
          } else if (payload.eventType === 'UPDATE') {
            setState(prev => ({
              ...prev,
              extractions: prev.extractions.map(e =>
                e.id === payload.new.id ? (payload.new as Extraction) : e
              ),
            }))
          } else if (payload.eventType === 'DELETE') {
            setState(prev => ({
              ...prev,
              extractions: prev.extractions.filter(e => e.id !== payload.old.id),
            }))
          }
        }
      )
      .subscribe()

    setRealtimeChannel(channel)

    return () => {
      channel.unsubscribe()
    }
  }, [enableRealtime, userId])

  return {
    ...state,
    refresh: loadExtractions,
    createExtraction,
    updateExtraction,
    deleteExtraction,
    getExtraction,
    getExtractionResults,
    downloadResultsCSV,
    cancelExtraction,
    retryExtraction,
  }
}
