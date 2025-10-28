/**
 * EXTRATIVO.AI - SUPABASE HELPERS
 * Funções auxiliares para operações comuns com Supabase
 */

import { supabase } from '@/lib/supabase-front/client/supabase'
import type { Database } from '@/lib/supabase-front/types'

type Extraction = Database['public']['Tables']['extractions']['Row']
type ExtractionResult = Database['public']['Tables']['extraction_results']['Row']
type UserProfile = Database['public']['Tables']['users']['Row']
type ApiKey = Database['public']['Tables']['api_keys']['Row']

/**
 * Formata data para exibição
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formata duração em segundos para texto legível
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

/**
 * Calcula duração de uma extração
 */
export function getExtractionDuration(extraction: Extraction): number | null {
  if (!extraction.started_at || !extraction.completed_at) return null

  const start = new Date(extraction.started_at).getTime()
  const end = new Date(extraction.completed_at).getTime()
  return Math.floor((end - start) / 1000)
}

/**
 * Formata status de extração para exibição
 */
export function formatExtractionStatus(status: Extraction['status']): string {
  const statusMap = {
    pending: 'Pendente',
    processing: 'Processando',
    completed: 'Concluído',
    failed: 'Falhou',
    cancelled: 'Cancelado',
  }
  return statusMap[status] || status
}

/**
 * Retorna cor baseada no status
 */
export function getStatusColor(status: Extraction['status']): string {
  const colorMap = {
    pending: 'text-yellow-600',
    processing: 'text-blue-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
    cancelled: 'text-gray-600',
  }
  return colorMap[status] || 'text-gray-600'
}

/**
 * Verifica se uma extração está ativa (pendente ou processando)
 */
export function isExtractionActive(extraction: Extraction): boolean {
  return extraction.status === 'pending' || extraction.status === 'processing'
}

/**
 * Verifica se uma extração pode ser cancelada
 */
export function canCancelExtraction(extraction: Extraction): boolean {
  return isExtractionActive(extraction)
}

/**
 * Verifica se uma extração pode ser reprocessada
 */
export function canRetryExtraction(extraction: Extraction): boolean {
  return extraction.status === 'failed' || extraction.status === 'cancelled'
}

/**
 * Busca todas as extrações de um usuário
 */
export async function getUserExtractions(userId: string) {
  const { data, error } = await supabase
    .from('extractions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Busca extração por ID com seus resultados
 */
export async function getExtractionWithResults(extractionId: string) {
  const { data: extraction, error: extractionError } = await supabase
    .from('extractions')
    .select('*')
    .eq('id', extractionId)
    .single()

  if (extractionError) return { data: null, error: extractionError }

  const { data: results, error: resultsError } = await supabase
    .from('extraction_results')
    .select('*')
    .eq('extraction_id', extractionId)
    .order('created_at', { ascending: false })

  if (resultsError) return { data: null, error: resultsError }

  return {
    data: {
      ...extraction,
      results,
    },
    error: null,
  }
}

/**
 * Conta resultados de uma extração
 */
export async function countExtractionResults(extractionId: string) {
  const { count, error } = await supabase
    .from('extraction_results')
    .select('*', { count: 'exact', head: true })
    .eq('extraction_id', extractionId)

  return { count, error }
}

/**
 * Busca API keys ativas de um usuário
 */
export async function getActiveApiKeys(userId: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Valida se uma API key é válida
 */
export async function validateApiKey(keyValue: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_value', keyValue)
    .eq('is_active', true)
    .single()

  return { isValid: !!data && !error, key: data, error }
}

/**
 * Atualiza último uso de uma API key
 */
export async function updateApiKeyLastUsed(keyId: string) {
  const { error } = await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyId)

  return { error }
}

/**
 * Busca perfil completo do usuário
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

/**
 * Busca extrações recentes do usuário
 */
export async function getRecentExtractions(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('extractions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

/**
 * Busca estatísticas gerais de extrações
 */
export async function getExtractionStats(userId: string) {
  const { data: extractions, error } = await supabase
    .from('extractions')
    .select('status')
    .eq('user_id', userId)

  if (error || !extractions) return { data: null, error }

  const stats = {
    total: extractions.length,
    pending: extractions.filter(e => e.status === 'pending').length,
    processing: extractions.filter(e => e.status === 'processing').length,
    completed: extractions.filter(e => e.status === 'completed').length,
    failed: extractions.filter(e => e.status === 'failed').length,
    cancelled: extractions.filter(e => e.status === 'cancelled').length,
  }

  return { data: stats, error: null }
}

/**
 * Upload de arquivo para storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) return { data: null, error }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)

  return { data: { ...data, publicUrl }, error: null }
}

/**
 * Remove arquivo do storage
 */
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  return { error }
}

/**
 * Subscreve a mudanças em tempo real de uma tabela
 */
export function subscribeToTable<T = any>(
  table: string,
  callback: (payload: T) => void,
  filter?: string
) {
  const channel = supabase.channel(`${table}_changes`)

  const subscription = channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table,
      filter,
    },
    callback
  )

  subscription.subscribe()

  return () => {
    channel.unsubscribe()
  }
}

/**
 * Converte dados para CSV
 */
export function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return ''

  const csvHeaders = headers || Object.keys(data[0])
  const csvRows = data.map(row =>
    csvHeaders.map(header => {
      const value = row[header]
      // Escapa aspas duplas e envolve em aspas se contém vírgula
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )

  return [csvHeaders.join(','), ...csvRows].join('\n')
}

/**
 * Download de dados como CSV
 */
export function downloadCSV(data: any[], filename: string, headers?: string[]) {
  const csv = convertToCSV(data, headers)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Limpa completamente o cache de autenticação do Supabase
 * Útil para resolver problemas com tokens corrompidos ou expirados
 */
export async function clearAuthCache(): Promise<void> {
  try {
    console.log('[clearAuthCache] Limpando cache de autenticação...')

    // Remove tokens do localStorage
    if (typeof window !== 'undefined') {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('extrativo-auth'))) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => {
        console.log('[clearAuthCache] Removendo:', key)
        localStorage.removeItem(key)
      })
    }

    // Faz sign out no Supabase
    await supabase.auth.signOut()

    console.log('[clearAuthCache] Cache limpo com sucesso!')
  } catch (error) {
    console.error('[clearAuthCache] Erro ao limpar cache:', error)
  }
}

/**
 * Verifica se há problemas com o token de autenticação
 */
export async function checkAuthHealth(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.getSession()
    return !error
  } catch {
    return false
  }
}
