/**
 * EXTRATIVO.AI - i18n CONFIGURATION (MULTI-LANGUAGE)
 * Configuração do i18next com suporte para Português, Inglês e Espanhol
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Portuguese (pt-BR)
import commonPtBR from '../locales/pt-BR/common.json'
import authPtBR from '../locales/pt-BR/auth.json'
import extractionsPtBR from '../locales/pt-BR/extractions.json'
import profilePtBR from '../locales/pt-BR/profile.json'
import sidebarPtBR from '../locales/pt-BR/sidebar.json'
import dashboardPtBR from '../locales/pt-BR/dashboard.json'
import analyticsPtBR from '../locales/pt-BR/analytics.json'

// English (en)
import commonEn from '../locales/en/common.json'
import authEn from '../locales/en/auth.json'
import extractionsEn from '../locales/en/extractions.json'
import profileEn from '../locales/en/profile.json'
import sidebarEn from '../locales/en/sidebar.json'
import dashboardEn from '../locales/en/dashboard.json'
import analyticsEn from '../locales/en/analytics.json'

// Spanish (es)
import commonEs from '../locales/es/common.json'
import authEs from '../locales/es/auth.json'
import extractionsEs from '../locales/es/extractions.json'
import profileEs from '../locales/es/profile.json'
import sidebarEs from '../locales/es/sidebar.json'
import dashboardEs from '../locales/es/dashboard.json'
import analyticsEs from '../locales/es/analytics.json'

// Translation resources - 3 languages × 7 namespaces = 21 imports
const resources = {
  'pt-BR': {
    common: commonPtBR,
    auth: authPtBR,
    extractions: extractionsPtBR,
    profile: profilePtBR,
    sidebar: sidebarPtBR,
    dashboard: dashboardPtBR,
    analytics: analyticsPtBR,
  },
  en: {
    common: commonEn,
    auth: authEn,
    extractions: extractionsEn,
    profile: profileEn,
    sidebar: sidebarEn,
    dashboard: dashboardEn,
    analytics: analyticsEn,
  },
  es: {
    common: commonEs,
    auth: authEs,
    extractions: extractionsEs,
    profile: profileEs,
    sidebar: sidebarEs,
    dashboard: dashboardEs,
    analytics: analyticsEs,
  },
}

// Configuração do i18next
i18n
  .use(LanguageDetector) // Detecta idioma automaticamente
  .use(initReactI18next) // Integração com React
  .init({
    resources,
    fallbackLng: 'pt-BR', // Idioma padrão
    supportedLngs: ['pt-BR', 'en', 'es'], // Idiomas suportados
    defaultNS: 'common', // Namespace padrão
    ns: ['common', 'auth', 'extractions', 'profile', 'sidebar', 'dashboard', 'analytics'],

    detection: {
      // Ordem de detecção: localStorage > querystring > cookie > navegador
      order: ['localStorage', 'querystring', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'extrativo-language',
    },

    interpolation: {
      escapeValue: false, // React já faz escape automaticamente
    },

    react: {
      useSuspense: false, // Desabilita suspense para evitar problemas com SSR
    },

    // Debug apenas em desenvolvimento e quando explicitamente ativado
    debug: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_I18N_DEBUG === 'true',
  })

export default i18n
