'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function AuthImage() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Evita flash durante hidratação
  if (!mounted) {
    return (
      <div className="relative hidden bg-black md:flex md:items-center md:justify-center md:p-8">
        <div className="flex flex-col items-center gap-6 max-w-md">
          <div className="h-16 w-64 bg-muted/20 rounded animate-pulse" />
          <div className="h-6 w-full bg-muted/20 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme
  const isDark = currentTheme === 'dark'

  return (
    <div className={`relative hidden md:flex md:items-center md:justify-center md:p-8 ${
      isDark ? 'bg-white' : 'bg-black'
    }`}>
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        {/* Logo - Fundo branco usa logo escura, fundo preto usa logo clara */}
        <img
          src={isDark ? '/logos/logo-dark.png' : '/logos/logo-light.png'}
          alt="Extrativo.AI"
          className="w-full max-w-sm h-auto"
        />

        {/* Slogan */}
        <p className={`text-xs font-medium whitespace-nowrap ${
          isDark ? 'text-black' : 'text-white'
        }`}>
          Inteligência B2B: Mapeie e extraia a sua vantagem.
        </p>
      </div>
    </div>
  )
}
