/**
 * EXTRATIVO.AI - i18n CONFIGURATION (OPTIMIZED)
 * Configuração otimizada do i18next - carrega apenas pt-BR e namespaces essenciais
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Imports APENAS do idioma padrão (pt-BR) e namespaces essenciais
// Reduzido de 21 para 7 imports (economia de ~66%)
import commonPtBR from '../locales/pt-BR/common.json'
import authPtBR from '../locales/pt-BR/auth.json'
import extractionsPtBR from '../locales/pt-BR/extractions.json'
import profilePtBR from '../locales/pt-BR/profile.json'
import sidebarPtBR from '../locales/pt-BR/sidebar.json'
import dashboardPtBR from '../locales/pt-BR/dashboard.json'
import analyticsPtBR from '../locales/pt-BR/analytics.json'

// Recursos de tradução - apenas pt-BR
// English e Spanish podem ser adicionados posteriormente se necessário
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
}

// Configuração do i18next
i18n
  .use(LanguageDetector) // Detecta idioma automaticamente
  .use(initReactI18next) // Integração com React
  .init({
    resources,
    fallbackLng: 'pt-BR', // Idioma padrão
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
