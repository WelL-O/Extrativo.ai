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
import { Globe, Check } from 'lucide-react'

export function LanguageSwitcher() {
  const { currentLanguageInfo, changeLanguage, availableLanguages } = useLanguage()
  const [mounted, setMounted] = useState(false)

  // Evita erro de hidratação renderizando apenas no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Obtém código curto do idioma (ex: "PT", "EN", "ES")
  const getShortCode = (code: Language) => {
    if (code === 'pt-BR') return 'PT'
    if (code === 'en') return 'EN'
    if (code === 'es') return 'ES'
    return code.toUpperCase().substring(0, 2)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm">
        <Globe className="mr-2 h-4 w-4" />
        <span>...</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Globe className="mr-1 h-4 w-4" />
          <span className="font-medium">{getShortCode(currentLanguageInfo.code)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {availableLanguages.map((lang) => {
          const isSelected = lang.code === currentLanguageInfo.code
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code as Language)}
              className={
                isSelected
                  ? 'bg-red-600 text-white hover:bg-red-700 hover:text-white font-medium'
                  : 'hover:bg-accent'
              }
            >
              <span className="flex-1">{lang.nativeName}</span>
              {isSelected && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
