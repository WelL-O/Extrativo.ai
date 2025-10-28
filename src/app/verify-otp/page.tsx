import { OTPForm } from "@/components/otp-form"
import { AuthHeader } from "@/components/auth-header"
import { BackgroundBlobs } from "@/components/background-blobs"

export default function VerifyOTPPage() {
  return (
    <>
      <BackgroundBlobs />
      <AuthHeader />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <OTPForm />
        </div>
      </div>
    </>
  )
}
