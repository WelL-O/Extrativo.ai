'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Command } from 'lucide-react'

export function SidebarLogo() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Placeholder durante hidratação
  if (!mounted) {
    return (
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Command className="size-4" />
      </div>
    )
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme
  const isDark = currentTheme === 'dark'

  return (
    <img
      src={isDark ? '/logos/logo-light.png' : '/logos/logo-dark.png'}
      alt="Extrativo.AI"
      className="h-8 w-auto"
    />
  )
}
