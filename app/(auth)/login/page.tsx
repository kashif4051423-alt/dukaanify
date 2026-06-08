import { Suspense } from 'react'
import { LoginFormContent } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Dukaanify',
}

export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to manage your businesses</p>
      </div>
      <Suspense fallback={<div className="animate-pulse py-8">Loading...</div>}>
        <LoginFormContent />
      </Suspense>
    </>
  )
}
