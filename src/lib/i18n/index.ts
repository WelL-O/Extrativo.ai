/**
 * EXTRATIVO.AI - i18n
 * Exportações centralizadas do módulo i18n
 */

// Config
export { default as i18n } from './config/i18n'

// Hooks
export { useLanguage, LANGUAGES } from './hooks/useLanguage'
export type { Language, LanguageInfo } from './hooks/useLanguage'

// Components
export { LanguageSwitcher } from './components/LanguageSwitcher'

// Re-export react-i18next
export { useTranslation, Trans, Translation } from 'react-i18next'
