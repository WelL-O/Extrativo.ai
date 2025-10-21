'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useAuth } from "@/lib/supabase-front"
import { useTranslation } from "@/lib/i18n"
import { useState, FormEvent, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useTranslation('auth')
  const { verifyOtp, resendOtp, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [mounted, setMounted] = useState(false)

  const email = searchParams.get('email') || ''

  // Evita erro de hidratação renderizando apenas no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-submit quando OTP estiver completo
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify()
    }
  }, [otp])

  const handleVerify = async () => {
    if (otp.length !== 6) return

    setError('')
    setSuccess(false)

    const { error: verifyError } = await verifyOtp({
      email,
      token: otp,
      type: 'email'
    })

    if (verifyError) {
      setError(t('verification_error'))
      setOtp('')
      return
    }

    setSuccess(true)

    // Redireciona para dashboard após sucesso
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  const handleResend = async () => {
    if (!email) {
      setError(t('email_required'))
      return
    }

    setResending(true)
    setError('')

    const { error: resendError } = await resendOtp(email)

    setResending(false)

    if (resendError) {
      setError(resendError.message)
      return
    }

    // Mostra mensagem de sucesso
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleVerify()
  }

  if (!mounted) {
    return (
      <div className={cn("flex flex-col gap-6 md:min-h-[450px]", className)} {...props}>
        <Card className="flex-1 overflow-hidden p-0">
          <CardContent className="grid flex-1 p-0 md:grid-cols-2">
            <div className="p-6 md:p-8 flex items-center justify-center">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
            <div className="relative hidden bg-muted md:block" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className={cn("flex flex-col gap-6 md:min-h-[450px]", className)}
      {...props}
    >
      <Card className="flex-1 overflow-hidden p-0">
        <CardContent className="grid flex-1 p-0 md:grid-cols-2">
          <form className="flex flex-col items-center justify-center p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field className="items-center text-center">
                <h1 className="text-2xl font-bold">{t('verify_email')}</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  {t('verification_code_sent')}
                </p>
                {email && (
                  <p className="text-muted-foreground text-xs mt-1">
                    {email}
                  </p>
                )}
              </Field>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-md text-center">
                  {t('verification_success')}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="otp" className="sr-only">
                  {t('verification_code')}
                </FieldLabel>
                <InputOTP
                  maxLength={6}
                  id="otp"
                  required
                  containerClassName="gap-4"
                  value={otp}
                  onChange={setOtp}
                  disabled={loading || success}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <FieldDescription className="text-center">
                  {t('enter_verification_code')}
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit" disabled={loading || otp.length !== 6 || success}>
                  {loading ? t('loading') : t('verify')}
                </Button>
                <FieldDescription className="text-center">
                  {t('didnt_receive_code')}{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || !email}
                    className="underline disabled:opacity-50"
                  >
                    {resending ? t('loading') : t('resend')}
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="text-center">
        {t('terms_and_privacy')} <a href="#" className="underline">{t('terms_of_service')}</a>{" "}
        {t('and')} <a href="#" className="underline">{t('privacy_policy')}</a>.
      </FieldDescription>
    </div>
  )
}
