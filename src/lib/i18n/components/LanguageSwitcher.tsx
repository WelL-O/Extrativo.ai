/**
 * EXTRATIVO.AI - LANGUAGE SWITCHER
 * Componente para trocar idioma da aplicação
 */

'use client'

import { useLanguage, type Language } from '../hooks/useLanguage'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState, useEffect } from 'react'

export function LanguageSwitcher() {
  const { currentLanguageInfo, changeLanguage, availableLanguages } = useLanguage()
  const [mounted, setMounted] = useState(false)

  // Evita erro de hidratação renderizando apenas no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm">
        <span className="mr-2">🌐</span>
        <span>...</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <span className="mr-2">{currentLanguageInfo.flag}</span>
          <span>{currentLanguageInfo.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code as Language)}
            className={
              lang.code === currentLanguageInfo.code
                ? 'bg-accent font-semibold'
                : ''
            }
          >
            <span className="mr-2">{lang.flag}</span>
            <span>{lang.nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
