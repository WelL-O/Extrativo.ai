import dynamic from 'next/dynamic'
import { LoginForm } from "@/components/login-form"
import { AuthHeader } from "@/components/auth-header"

// Lazy load BackgroundBlobs (decorative, not critical)
const BackgroundBlobs = dynamic(
  () => import("@/components/background-blobs").then((mod) => ({ default: mod.BackgroundBlobs })),
  { ssr: false }
)

export default function LoginPage() {
  return (
    <>
      <BackgroundBlobs />
      <AuthHeader />
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <LoginForm />
        </div>
      </div>
    </>
  )
}
