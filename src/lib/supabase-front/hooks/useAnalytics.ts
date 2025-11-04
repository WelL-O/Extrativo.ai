/**
 * EXTRATIVO - ANALYTICS HOOK
 * Hook para buscar dados analíticos e métricas
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-front/client/supabase'

interface TimelineData {
  date: string
  extractions: number
  leads: number
  successRate: number
}

interface CategoryData {
  category: string
  count: number
}

interface ProjectPerformance {
  id: string
  name: string
  totalExtractions: number
  totalLeads: number
  successRate: number
}

interface LocationData {
  latitude: number
  longitude: number
  count: number
  category?: string
}

interface AnalyticsData {
  // KPIs
  successRate: number
  totalLeads: number
  totalExtractions: number
  avgLeadsPerExtraction: number
  bestProject: string | null

  // Charts data
  timeline: TimelineData[]
  byCategory: CategoryData[]
  byProject: ProjectPerformance[]
  locations: LocationData[]
}

interface UseAnalyticsOptions {
  userId?: string
  days?: number // Período de análise (padrão: 30)
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { userId, days = 30 } = options

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadAnalytics = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Data de início (X dias atrás)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // 1. Buscar todas as extrações do período
      const { data: extractions, error: extractionsError } = await supabase
        .from('extractions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (extractionsError) throw extractionsError

      // 2. Buscar resultados para categorias e localizações
      const { data: results, error: resultsError } = await supabase
        .from('extraction_results')
        .select('category, latitude, longitude, extraction_id')
        .eq('user_id', userId)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (resultsError) throw resultsError

      // 3. Buscar projetos
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', userId)
        .is('deleted_at', null)

      if (projectsError) throw projectsError

      // === PROCESSAMENTO DOS DADOS ===

      // KPIs
      const totalExtractions = extractions?.length || 0
      const completedExtractions = extractions?.filter(e => e.status === 'completed').length || 0
      const successRate = totalExtractions > 0 ? (completedExtractions / totalExtractions) * 100 : 0
      const totalLeads = extractions?.reduce((sum, e) => sum + (e.total_results || 0), 0) || 0
      const avgLeadsPerExtraction = totalExtractions > 0 ? totalLeads / totalExtractions : 0

      // Timeline (agrupa por dia)
      const timelineMap = new Map<string, { extractions: number; leads: number; completed: number }>()

      extractions?.forEach((extraction) => {
        const date = new Date(extraction.created_at).toISOString().split('T')[0]
        const current = timelineMap.get(date) || { extractions: 0, leads: 0, completed: 0 }

        current.extractions++
        current.leads += extraction.total_results || 0
        if (extraction.status === 'completed') current.completed++

        timelineMap.set(date, current)
      })

      const timeline: TimelineData[] = Array.from(timelineMap.entries())
        .map(([date, data]) => ({
          date,
          extractions: data.extractions,
          leads: data.leads,
          successRate: data.extractions > 0 ? (data.completed / data.extractions) * 100 : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Por categoria
      const categoryMap = new Map<string, number>()
      results?.forEach((result) => {
        const cat = result.category || 'Sem categoria'
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
      })

      const byCategory: CategoryData[] = Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 categorias

      // Por projeto
      const projectPerformance: ProjectPerformance[] = projects?.map(project => {
        const projectExtractions = extractions?.filter(e => e.project_id === project.id) || []
        const completed = projectExtractions.filter(e => e.status === 'completed').length
        const leads = projectExtractions.reduce((sum, e) => sum + (e.total_results || 0), 0)

        return {
          id: project.id,
          name: project.name,
          totalExtractions: projectExtractions.length,
          totalLeads: leads,
          successRate: projectExtractions.length > 0 ? (completed / projectExtractions.length) * 100 : 0,
        }
      }).sort((a, b) => b.totalLeads - a.totalLeads) || []

      const bestProject = projectPerformance[0]?.name || null

      // Localizações para heatmap
      const locations: LocationData[] = results?.map(r => ({
        latitude: r.latitude!,
        longitude: r.longitude!,
        count: 1,
        category: r.category || undefined,
      })) || []

      // Monta resultado final
      setData({
        successRate,
        totalLeads,
        totalExtractions,
        avgLeadsPerExtraction,
        bestProject,
        timeline,
        byCategory,
        byProject: projectPerformance,
        locations,
      })
    } catch (err) {
      setError(err as Error)
      console.error('Erro ao carregar analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [userId, days])

  return {
    data,
    loading,
    error,
    refresh: loadAnalytics,
  }
}
