/**
 * EXTRATIVO.AI - PROVIDERS
 * Centraliza todos os providers da aplicação
 */

'use client'

import { AuthProvider } from '@/lib/supabase-front'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n/config/i18n'
import { ThemeProvider } from '@/components/theme-provider'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </I18nextProvider>
    </ThemeProvider>
  )
}
