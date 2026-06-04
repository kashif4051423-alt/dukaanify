'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createBusiness, type BusinessFormState } from '@/lib/actions/business'
import { slugify } from '@/lib/utils/format'
import Image from 'next/image'

const CURRENCIES = [
  { code: 'PKR', label: 'PKR — Pakistani Rupee' },
  { code: 'INR', label: 'INR — Indian Rupee' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'AED', label: 'AED — UAE Dirham' },
]

const initialState: BusinessFormState = {}

export function CreateBusinessForm() {
  const router = useRouter()
  const [state, action] = useActionState(createBusiness, initialState)
  const [name, setName] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [slug, setSlug] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Auto-generate slug from name unless user has manually edited it
  useEffect(() => {
    if (!slugEdited) setSlug(slugify(name))
  }, [name, slugEdited])

  // Handle client-side redirect after successful creation
  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state.redirectTo, router])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be under 2 MB.')
      e.target.value = ''
      return
    }
    setLogoPreview(URL.createObjectURL(file))
  }

  return (
    <form action={action} className="space-y-6">
      {/* Global error */}
      {state.error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertIcon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      {/* Logo upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Logo <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors flex items-center justify-center overflow-hidden bg-gray-50 group"
          >
            {logoPreview ? (
              <Image src={logoPreview} alt="Logo preview" fill className="object-cover" sizes="64px" />
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

      {/* Business name */}
      <div>
        <label htmlFor="biz-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          id="biz-name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          autoComplete="off"
          className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
            state.fieldErrors?.name ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="My Awesome Store"
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-red-600 mt-1">{state.fieldErrors.name}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="biz-slug" className="block text-sm font-medium text-gray-700 mb-1.5">
          Store URL <span className="text-red-500">*</span>
        </label>
        <div className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition ${
          state.fieldErrors?.slug ? 'border-red-400' : 'border-gray-300'
        }`}>
          <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-300 select-none whitespace-nowrap">
            dukaanify.com/
          </span>
          <input
            id="biz-slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugEdited(true)
              setSlug(slugify(e.target.value))
            }}
            required
            autoComplete="off"
            className="flex-1 px-3 py-2.5 text-sm text-gray-900 focus:outline-none bg-white min-w-0"
            placeholder="my-awesome-store"
          />
        </div>
        {state.fieldErrors?.slug ? (
          <p className="text-xs text-red-600 mt-1">{state.fieldErrors.slug}</p>
        ) : slug ? (
          <p className="text-xs text-gray-400 mt-1">Your store will be at /{slug}</p>
        ) : null}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="biz-description" className="block text-sm font-medium text-gray-700 mb-1.5">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="biz-description"
          name="description"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
          placeholder="What does your business sell?"
        />
      </div>

      {/* Currency */}
      <div>
        <label htmlFor="biz-currency" className="block text-sm font-medium text-gray-700 mb-1.5">
          Currency
        </label>
        <select
          id="biz-currency"
          name="currency"
          defaultValue="PKR"
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
    >
      {pending && <SpinnerIcon className="w-4 h-4 animate-spin" />}
      {pending ? 'Creating...' : 'Create Business'}
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
