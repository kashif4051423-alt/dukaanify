'use client'

import { useActionState, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateBusiness } from '@/lib/actions/business'
import type { Business } from '@/types/models'
import Image from 'next/image'

const CURRENCIES = [
  { code: 'PKR', label: 'PKR — Pakistani Rupee' },
  { code: 'INR', label: 'INR — Indian Rupee' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'AED', label: 'AED — UAE Dirham' },
]

export function EditBusinessForm({ business }: { business: Business }) {
  const boundAction = updateBusiness.bind(null, business.id)
  const [state, action] = useActionState(boundAction, {})
  const [logoPreview, setLogoPreview] = useState<string | null>(business.logo_url)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be under 2 MB.')
      return
    }
    setLogoPreview(URL.createObjectURL(file))
  }

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertIcon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      {/* Success */}
      {!state.error && Object.keys(state).length === 0 && (
        <></>
      )}

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors flex items-center justify-center overflow-hidden bg-gray-50 group"
          >
            {logoPreview ? (
              <Image src={logoPreview} alt="Logo" fill className="object-cover" sizes="64px" />
            ) : (
              <CameraIcon className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            )}
          </button>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {logoPreview ? 'Change logo' : 'Upload logo'}
            </button>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 2 MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            name="logo"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleLogoChange}
            className="hidden"
          />
        </div>
        {state.fieldErrors?.logo && (
          <p className="text-xs text-red-600 mt-1">{state.fieldErrors.logo}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          id="edit-name"
          name="name"
          type="text"
          defaultValue={business.name}
          required
          className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
            state.fieldErrors?.name ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-red-600 mt-1">{state.fieldErrors.name}</p>
        )}
      </div>

      {/* Slug (read-only — changing slug breaks URLs) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Store URL</label>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <span className="px-3 py-2.5 text-gray-400 text-sm border-r border-gray-200 select-none">
            dukaanify.com/
          </span>
          <span className="px-3 py-2.5 text-sm text-gray-500">{business.slug}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Store URL cannot be changed after creation.</p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1.5">
          Description
        </label>
        <textarea
          id="edit-description"
          name="description"
          rows={3}
          defaultValue={business.description ?? ''}
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
          placeholder="What does your business sell?"
        />
      </div>

      {/* Currency */}
      <div>
        <label htmlFor="edit-currency" className="block text-sm font-medium text-gray-700 mb-1.5">
          Currency
        </label>
        <select
          id="edit-currency"
          name="currency"
          defaultValue={business.currency}
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* WhatsApp number */}
      <div>
        <label htmlFor="edit-whatsapp" className="block text-sm font-medium text-gray-700 mb-1.5">
          WhatsApp Number
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition">
          <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">
            +
          </span>
          <input
            id="edit-whatsapp"
            name="whatsapp_number"
            type="text"
            defaultValue={business.whatsapp_number ?? ''}
            className="flex-1 px-3 py-2.5 text-sm text-gray-900 focus:outline-none bg-white"
            placeholder="923001234567 (country code + number, no spaces)"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Customers can order directly via WhatsApp. Include country code (e.g. 92 for Pakistan).
        </p>
      </div>

      {/* Payment Methods */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">Payment Methods</p>
        <p className="text-xs text-gray-400 mb-3">
          Enter your account numbers. Only methods with a number will be shown to customers.
        </p>
        <div className="space-y-3">
          {/* JazzCash */}
          <div>
            <label htmlFor="edit-jazzcash" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <span className="w-5 h-5 rounded bg-red-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">J</span>
              JazzCash Number
            </label>
            <input
              id="edit-jazzcash"
              name="jazzcash_number"
              type="text"
              defaultValue={(business as Business & { jazzcash_number?: string | null }).jazzcash_number ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="03XX-XXXXXXX"
            />
          </div>

          {/* Easypaisa */}
          <div>
            <label htmlFor="edit-easypaisa" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <span className="w-5 h-5 rounded bg-green-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">E</span>
              Easypaisa Number
            </label>
            <input
              id="edit-easypaisa"
              name="easypaisa_number"
              type="text"
              defaultValue={(business as Business & { easypaisa_number?: string | null }).easypaisa_number ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="03XX-XXXXXXX"
            />
          </div>

          {/* SadaPay */}
          <div>
            <label htmlFor="edit-sadapay" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <span className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">S</span>
              SadaPay Number
            </label>
            <input
              id="edit-sadapay"
              name="sadapay_number"
              type="text"
              defaultValue={(business as Business & { sadapay_number?: string | null }).sadapay_number ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="03XX-XXXXXXX"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Cash on Delivery is always available. Digital methods only show if you enter a number.
        </p>
      </div>

      <SaveButton />
    </form>
  )
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
    >
      {pending && <SpinnerIcon className="w-4 h-4 animate-spin" />}
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  )
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
