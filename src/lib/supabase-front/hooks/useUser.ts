/**
 * EXTRATIVO.AI - USER HOOK
 * Hook para gerenciar perfil de usuário e API keys
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-front/client/supabase'
import type { Database } from '@/lib/supabase-front/types'

type UserProfile = Database['public']['Tables']['profiles']['Row']
type UserUpdate = Database['public']['Tables']['profiles']['Update']
type ApiKey = Database['public']['Tables']['api_keys']['Row']
type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert']

interface UserState {
  profile: UserProfile | null
  apiKeys: ApiKey[]
  loading: boolean
  error: Error | null
}

interface UseUserOptions {
  userId?: string
  loadApiKeys?: boolean
}

export function useUser(options: UseUserOptions = {}) {
  const { userId, loadApiKeys = true } = options

  const [state, setState] = useState<UserState>({
    profile: null,
    apiKeys: [],
    loading: true,
    error: null,
  })

  // Carrega perfil do usuário
  const loadProfile = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        profile: data,
        loading: false,
      }))

      // Carrega API keys se solicitado
      if (loadApiKeys) {
        await loadUserApiKeys(id)
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }))
    }
  }

  // Carrega API keys do usuário
  const loadUserApiKeys = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setState(prev => ({
        ...prev,
        apiKeys: data || [],
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }))
    }
  }

  // Atualiza perfil
  const updateProfile = async (updates: UserUpdate) => {
    if (!state.profile) {
      return { data: null, error: new Error('No profile loaded') }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.profile.id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        profile: data,
      }))

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Cria nova API key
  const createApiKey = async (name: string) => {
    if (!state.profile) {
      return { data: null, error: new Error('No profile loaded') }
    }

    try {
      // Gera key aleatória
      const keyValue = `ext_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

      const newKey: ApiKeyInsert = {
        user_id: state.profile.id,
        key_name: name,
        key_value: keyValue,
        is_active: true,
      }

      const { data, error } = await supabase
        .from('api_keys')
        .insert(newKey)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        apiKeys: [data, ...prev.apiKeys],
      }))

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Revoga API key
  const revokeApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId)

      if (error) throw error

      setState(prev => ({
        ...prev,
        apiKeys: prev.apiKeys.map(k =>
          k.id === keyId ? { ...k, is_active: false } : k
        ),
      }))

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Deleta API key
  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', keyId)

      if (error) throw error

      setState(prev => ({
        ...prev,
        apiKeys: prev.apiKeys.filter(k => k.id !== keyId),
      }))

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Upload de avatar
  const uploadAvatar = async (file: File) => {
    if (!state.profile) {
      return { data: null, error: new Error('No profile loaded') }
    }

    try {
      // Remove avatar antigo se existir
      if (state.profile.avatar_url) {
        const oldPath = state.profile.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      // Upload novo avatar
      const fileExt = file.name.split('.').pop()
      const fileName = `${state.profile.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Pega URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName)

      // Atualiza perfil
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', state.profile.id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        profile: data,
      }))

      return { data: publicUrl, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Remove avatar
  const removeAvatar = async () => {
    if (!state.profile?.avatar_url) {
      return { error: null }
    }

    try {
      // Remove do storage
      const path = state.profile.avatar_url.split('/').pop()
      if (path) {
        await supabase.storage.from('avatars').remove([path])
      }

      // Atualiza perfil
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', state.profile.id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        profile: data,
      }))

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Busca estatísticas do usuário
  const getUserStats = async () => {
    if (!state.profile) {
      return {
        data: null,
        error: new Error('No profile loaded'),
      }
    }

    try {
      // Total de extrações
      const { count: totalExtractions, error: extractionsError } = await supabase
        .from('extractions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', state.profile.id)

      if (extractionsError) throw extractionsError

      // Extrações completadas
      const { count: completedExtractions, error: completedError } = await supabase
        .from('extractions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', state.profile.id)
        .eq('status', 'completed')

      if (completedError) throw completedError

      // Extrações falhadas
      const { count: failedExtractions, error: failedError } = await supabase
        .from('extractions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', state.profile.id)
        .eq('status', 'failed')

      if (failedError) throw failedError

      // Total de resultados
      const { count: totalResults, error: resultsError } = await supabase
        .from('extraction_results')
        .select('extraction_id', { count: 'exact', head: true })
        .in(
          'extraction_id',
          supabase
            .from('extractions')
            .select('id')
            .eq('user_id', state.profile.id)
        )

      if (resultsError) throw resultsError

      const stats = {
        totalExtractions: totalExtractions || 0,
        completedExtractions: completedExtractions || 0,
        failedExtractions: failedExtractions || 0,
        totalResults: totalResults || 0,
        activeApiKeys: state.apiKeys.filter(k => k.is_active).length,
      }

      return { data: stats, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Effect: Carregamento inicial
  useEffect(() => {
    if (userId) {
      loadProfile(userId)
    }
  }, [userId])

  return {
    ...state,
    refresh: () => userId && loadProfile(userId),
    updateProfile,
    createApiKey,
    revokeApiKey,
    deleteApiKey,
    uploadAvatar,
    removeAvatar,
    getUserStats,
  }
}
