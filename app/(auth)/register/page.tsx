import { RegisterForm } from '@/components/auth/RegisterForm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account — Dukaanify',
}

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-sm text-gray-500 mt-1">Start with 1 free business</p>
      </div>
      <RegisterForm />
      <div className="mt-5 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-center">
        <p className="text-xs text-indigo-700 font-medium">
          Want more businesses?{' '}
          <Link href="/pricing" className="font-bold underline hover:text-indigo-900">
            View Pricing Plans →
          </Link>
        </p>
      </div>
    </>
  )
}
