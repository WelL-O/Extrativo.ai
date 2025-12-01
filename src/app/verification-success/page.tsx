'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthHeader } from "@/components/auth-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from 'lucide-react'
import { Progress } from "@/components/ui/progress"

// Lazy load BackgroundBlobs (decorative, not critical)
const BackgroundBlobs = dynamic(
  () => import("@/components/background-blobs").then((mod) => ({ default: mod.BackgroundBlobs })),
  { ssr: false }
)

export default function VerificationSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          router.push('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2 // 100% / 5 seconds = 20% per second
      })
    }, 100)

    return () => {
      clearInterval(countdownInterval)
      clearInterval(progressInterval)
    }
  }, [router])

  return (
    <>
      <BackgroundBlobs />
      <AuthHeader />
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Conta verificada com sucesso!</CardTitle>
              <CardDescription>
                Sua conta foi verificada e está pronta para uso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Você será redirecionado para a página de login em{' '}
                <span className="font-semibold text-foreground">{countdown}</span>{' '}
                {countdown === 1 ? 'segundo' : 'segundos'}...
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-center">
                <button
                  onClick={() => router.push('/login')}
                  className="text-sm text-primary hover:underline"
                >
                  Ir para login agora
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
