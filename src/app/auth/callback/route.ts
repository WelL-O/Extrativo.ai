/**
 * EXTRATIVO.AI - AUTH CALLBACK
 * Processa o callback de autenticação do Supabase (Magic Link)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Troca o código por uma sessão
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      // Redireciona para login com erro
      return NextResponse.redirect(`${requestUrl.origin}/login?error=authentication_failed`)
    }

    // Sucesso - redireciona para dashboard
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  }

  // Sem código - redireciona para login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
