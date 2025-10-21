/**
 * EXTRATIVO.AI - LANGUAGE HOOK
 * Hook para gerenciar idioma da aplicação
 */

'use client'

import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

export type Language = 'pt-BR' | 'en' | 'es'

export interface LanguageInfo {
  code: Language
  name: string
  nativeName: string
  flag: string
}

export const LANGUAGES: Record<Language, LanguageInfo> = {
  'pt-BR': {
    code: 'pt-BR',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
}

export function useLanguage() {
  const { i18n, t } = useTranslation()

  // Garante que o idioma está carregado
  useEffect(() => {
    const savedLanguage = localStorage.getItem('extrativo-language')
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage)
    }
  }, [])

  const currentLanguage = (i18n.language || 'pt-BR') as Language
  const currentLanguageInfo = LANGUAGES[currentLanguage] || LANGUAGES['pt-BR']

  const changeLanguage = async (language: Language) => {
    await i18n.changeLanguage(language)
    localStorage.setItem('extrativo-language', language)
  }

  const availableLanguages = Object.values(LANGUAGES)

  return {
    currentLanguage,
    currentLanguageInfo,
    changeLanguage,
    availableLanguages,
    t,
    i18n,
  }
}
