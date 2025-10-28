/**
 * EXTRATIVO.AI - CHECK EMAIL PAGE
 * Página que informa o usuário para verificar o email
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { AuthHeader } from '@/components/auth-header'
import { BackgroundBlobs } from '@/components/background-blobs'
import { AuthImage } from '@/components/auth-image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function CheckEmailPage() {
  const { t } = useTranslation('auth')
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  const email = searchParams.get('email') || ''

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                Carregando...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <BackgroundBlobs />
      <AuthHeader />
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <Card className="overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    {/* Ícone de Email */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-8 w-8 text-primary"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold">{t('check_your_email')}</h1>
                      <p className="text-balance text-muted-foreground mt-2">
                        {t('magic_link_sent')}
                      </p>
                      {email && (
                        <p className="text-sm text-muted-foreground mt-2 font-medium">
                          {email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      {t('click_link_to_confirm')}
                    </p>
                  </div>

                  <div className="text-center text-sm">
                    {t('didnt_receive_email')}{' '}
                    <button className="underline underline-offset-4">
                      {t('resend')}
                    </button>
                  </div>

                  <div className="text-center text-sm">
                    <Link href="/login" className="underline underline-offset-4">
                      {t('back_to_login')}
                    </Link>
                  </div>
                </div>
              </div>
              <AuthImage />
            </CardContent>
          </Card>
          <div className="mt-6 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            {t('terms_and_privacy')} <a href="#">{t('terms_of_service')}</a>{' '}
            {t('and')} <a href="#">{t('privacy_policy')}</a>.
          </div>
        </div>
      </div>
    </>
  )
}
