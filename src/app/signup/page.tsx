import { SignupForm } from "@/components/signup-form"
import { AuthHeader } from "@/components/auth-header"

export default function SignupPage() {
  return (
    <>
      <AuthHeader />
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <SignupForm />
        </div>
      </div>
    </>
  )
}
