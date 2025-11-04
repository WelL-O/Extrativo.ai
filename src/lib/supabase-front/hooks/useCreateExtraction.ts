/**
 * EXTRATIVO - CREATE EXTRACTION HOOK
 * Hook para criar novas extrações
 */

import { useState } from 'react'
import { supabase } from '@/lib/supabase-front/client/supabase'
import type { Database } from '@/lib/supabase-front/types'
import { ExtractionFormData } from '@/lib/schemas/extraction'

type ExtractionInsert = Database['public']['Tables']['extractions']['Insert']

export function useCreateExtraction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createExtraction = async (data: ExtractionFormData, userId: string) => {
    setLoading(true)
    setError(null)

    try {
      // Preparar dados para inserção
      const extractionData: ExtractionInsert = {
        user_id: userId,
        name: data.name,
        description: data.description || null,
        project_id: data.project_id || null,
        keywords: data.keywords,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        country_code: data.country_code,
        language: data.language,
        max_results: data.max_results,
        extract_emails: data.extract_emails,
        extract_reviews: data.extract_reviews,
        fast_mode: data.fast_mode,
        depth: data.depth,
        status: 'pending',
      }

      const { data: extraction, error: insertError } = await supabase
        .from('extractions')
        .insert(extractionData)
        .select()
        .single()

      if (insertError) throw insertError

      // TODO: Criar job no extrativo-core via API
      // await fetch('/api/extractions/start', {
      //   method: 'POST',
      //   body: JSON.stringify({ extractionId: extraction.id })
      // })

      return { data: extraction, error: null }
    } catch (err) {
      const error = err as Error
      setError(error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  return {
    createExtraction,
    loading,
    error,
  }
}
