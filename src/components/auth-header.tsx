'use client'

import { ThemeToggle } from './theme-toggle'
import { LanguageSwitcher } from '@/lib/i18n'

export function AuthHeader() {
  return (
    <div className="fixed top-0 right-0 p-4 flex items-center gap-2 z-50">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  )
}
