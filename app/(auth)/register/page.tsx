import { RegisterForm } from "@/components/auth/register-form"
import { Suspense } from "react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Restaurant CRM Scraper</h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>
        <Suspense fallback={<div className="text-center p-4">Loading registration form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
