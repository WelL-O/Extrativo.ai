/**
 * EXTRATIVO.AI - i18n CONFIGURATION
 * Configuração do i18next para suporte multi-idioma
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Imports de traduções
import commonPtBR from '../locales/pt-BR/common.json'
import authPtBR from '../locales/pt-BR/auth.json'
import extractionsPtBR from '../locales/pt-BR/extractions.json'
import profilePtBR from '../locales/pt-BR/profile.json'
import sidebarPtBR from '../locales/pt-BR/sidebar.json'
import dashboardPtBR from '../locales/pt-BR/dashboard.json'
import analyticsPtBR from '../locales/pt-BR/analytics.json'

import commonEn from '../locales/en/common.json'
import authEn from '../locales/en/auth.json'
import extractionsEn from '../locales/en/extractions.json'
import profileEn from '../locales/en/profile.json'
import sidebarEn from '../locales/en-US/sidebar.json'
import dashboardEn from '../locales/en-US/dashboard.json'
import analyticsEn from '../locales/en/analytics.json'

import commonEs from '../locales/es/common.json'
import authEs from '../locales/es/auth.json'
import extractionsEs from '../locales/es/extractions.json'
import profileEs from '../locales/es/profile.json'
import sidebarEs from '../locales/es-ES/sidebar.json'
import dashboardEs from '../locales/es-ES/dashboard.json'
import analyticsEs from '../locales/es/analytics.json'

// Recursos de tradução organizados por idioma e namespace
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
    defaultNS: 'common', // Namespace padrão
    ns: ['common', 'auth', 'extractions', 'profile', 'sidebar', 'dashboard', 'analytics'], // Namespaces disponíveis

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

    // Debug habilitado temporariamente para verificar carregamento
    debug: true,
  })

export default i18n
