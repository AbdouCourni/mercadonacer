// File: app/(auth)/login/page.tsx
// Path: /app/(auth)/login/page.tsx

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import LoginForm from './login-form'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}