import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set New Password — Dukaanify',
}

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
        <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account.</p>
      </div>
      <ResetPasswordForm />
    </>
  )
}
