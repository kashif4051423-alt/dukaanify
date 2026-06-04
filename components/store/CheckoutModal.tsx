'use client'

import { useState, useTransition } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { placeOrder } from '@/lib/actions/order'
import { formatCurrency } from '@/lib/utils/format'

type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa' | 'sadapay'

interface PaymentConfig {
  jazzcash: string | null
  easypaisa: string | null
  sadapay: string | null
}

interface Props {
  businessId: string
  businessSlug: string
  businessName: string
  currency: string
  whatsappNumber?: string | null
  paymentConfig: PaymentConfig
  open: boolean
  onClose: () => void
}

type Step = 'form' | 'success'

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod
  label: string
  emoji: string
  color: string
  bg: string
  border: string
  activeBg: string
  activeBorder: string
  activeText: string
  instructions: (number: string | null) => string
}> = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    emoji: '💵',
    color: 'text-emerald-700',
    bg: 'bg-white',
    border: 'border-gray-200',
    activeBg: 'bg-emerald-50',
    activeBorder: 'border-emerald-500',
    activeText: 'text-emerald-700',
    instructions: () => 'Pay cash when your order is delivered to your door.',
  },
  {
    id: 'jazzcash',
    label: 'JazzCash',
    emoji: '🔴',
    color: 'text-red-700',
    bg: 'bg-white',
    border: 'border-gray-200',
    activeBg: 'bg-red-50',
    activeBorder: 'border-red-500',
    activeText: 'text-red-700',
    instructions: (num) => num
      ? `Send payment to JazzCash number: ${num}\nThen place your order.`
      : 'JazzCash payment — account number will be shared after order.',
  },
  {
    id: 'easypaisa',
    label: 'Easypaisa',
    emoji: '🟢',
    color: 'text-green-700',
    bg: 'bg-white',
    border: 'border-gray-200',
    activeBg: 'bg-green-50',
    activeBorder: 'border-green-500',
    activeText: 'text-green-700',
    instructions: (num) => num
      ? `Send payment to Easypaisa number: ${num}\nThen place your order.`
      : 'Easypaisa payment — account number will be shared after order.',
  },
  {
    id: 'sadapay',
    label: 'SadaPay',
    emoji: '🟣',
    color: 'text-purple-700',
    bg: 'bg-white',
    border: 'border-gray-200',
    activeBg: 'bg-purple-50',
    activeBorder: 'border-purple-500',
    activeText: 'text-purple-700',
    instructions: (num) => num
      ? `Send payment to SadaPay number: ${num}\nThen place your order.`
      : 'SadaPay payment — account number will be shared after order.',
  },
]

export function CheckoutModal({
  businessId, businessSlug, businessName, currency,
  whatsappNumber, paymentConfig, open, onClose,
}: Props) {
  const { getItems, getTotal, getCount, clearCart } = useCartStore()
  const items = getItems(businessSlug)
  const total = getTotal(businessSlug)
  const count = getCount(businessSlug)

  const [step, setStep] = useState<Step>('form')
  const [orderNumber, setOrderNumber] = useState('')
  const [orderId, setOrderId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleClose() {
    if (step === 'success') {
      setStep('form')
      setForm({ name: '', email: '', phone: '', address: '', notes: '' })
      setOrderNumber('')
      setOrderId('')
      setPaymentMethod('cod')
    }
    setError(null)
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await placeOrder({
        businessId,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        customerAddress: form.address,
        notes: form.notes,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPrice: i.product.price,
        })),
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setOrderNumber(result.orderNumber!)
      setOrderId(result.orderId!)
      clearCart(businessSlug)
      setStep('success')
    })
  }

  // Build WhatsApp message for after order
  function openWhatsApp() {
    if (!whatsappNumber) return
    const selectedOption = PAYMENT_OPTIONS.find((p) => p.id === paymentMethod)!
    const paymentNum = paymentMethod === 'jazzcash' ? paymentConfig.jazzcash
      : paymentMethod === 'easypaisa' ? paymentConfig.easypaisa
      : paymentMethod === 'sadapay' ? paymentConfig.sadapay
      : null

    const itemLines = items.map(
      ({ product, quantity }) =>
        `• ${product.name} x${quantity} — ${formatCurrency(product.price * quantity, currency)}`
    )

    const message = [
      `Hi ${businessName}! I'd like to place an order:`,
      '',
      ...itemLines,
      '',
      `*Total: ${formatCurrency(total, currency)}*`,
      `*Payment: ${selectedOption.label}${paymentNum ? ` (${paymentNum})` : ''}*`,
      '',
      `Order #${orderNumber}`,
      'Please confirm my order. Thank you!',
    ].join('\n')

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (!open) return null

  const selectedOption = PAYMENT_OPTIONS.find((p) => p.id === paymentMethod)!
  const paymentAccountNumber =
    paymentMethod === 'jazzcash' ? paymentConfig.jazzcash
    : paymentMethod === 'easypaisa' ? paymentConfig.easypaisa
    : paymentMethod === 'sadapay' ? paymentConfig.sadapay
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />

      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[94vh] flex flex-col shadow-2xl">
        {step === 'success' ? (
          <SuccessView
            orderNumber={orderNumber}
            businessName={businessName}
            paymentMethod={paymentMethod}
            paymentLabel={selectedOption.label}
            paymentAccountNumber={paymentAccountNumber}
            total={total}
            currency={currency}
            whatsappNumber={whatsappNumber ?? null}
            onWhatsApp={openWhatsApp}
            onClose={handleClose}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="font-bold text-gray-900">Checkout</h2>
                <p className="text-xs text-gray-400 mt-0.5">{businessName}</p>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

                {/* Order summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Order Summary · {count} item{count !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-2">
                    {items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate mr-2">
                          {product.name}
                          <span className="text-gray-400 ml-1">×{quantity}</span>
                        </span>
                        <span className="font-medium text-gray-900 shrink-0">
                          {formatCurrency(product.price * quantity, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-indigo-600 text-lg">
                      {formatCurrency(total, currency)}
                    </span>
                  </div>
                </div>

                {/* Payment method selector */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_OPTIONS.map((opt) => {
                      const isActive = paymentMethod === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPaymentMethod(opt.id)}
                          className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 text-left transition-all ${
                            isActive
                              ? `${opt.activeBg} ${opt.activeBorder} ${opt.activeText}`
                              : `${opt.bg} ${opt.border} text-gray-600 hover:border-gray-300`
                          }`}
                        >
                          <span className="text-xl leading-none">{opt.emoji}</span>
                          <span className="text-sm font-semibold">{opt.label}</span>
                          {isActive && <CheckIcon className="w-4 h-4 ml-auto shrink-0" />}
                        </button>
                      )
                    })}
                  </div>

                  {/* Payment instructions */}
                  <div className={`mt-3 rounded-xl px-4 py-3 text-sm ${selectedOption.activeBg} border ${selectedOption.activeBorder}`}>
                    <p className={`font-semibold ${selectedOption.activeText} mb-1`}>
                      {selectedOption.emoji} {selectedOption.label} Instructions
                    </p>
                    <p className="text-gray-600 text-xs whitespace-pre-line">
                      {selectedOption.instructions(paymentAccountNumber)}
                    </p>
                  </div>
                </div>

                {/* Delivery details */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Delivery Details
                  </p>
                  <div className="space-y-3">
                    <Field id="co-name" label="Full Name" required>
                      <input id="co-name" name="name" type="text" value={form.name} onChange={handleChange} required autoComplete="name" className={inputCls} placeholder="Your full name" />
                    </Field>
                    <Field id="co-phone" label="Phone Number" required>
                      <input id="co-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required autoComplete="tel" className={inputCls} placeholder="+92 300 1234567" />
                    </Field>
                    <Field id="co-email" label="Email" hint="optional">
                      <input id="co-email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" className={inputCls} placeholder="you@example.com" />
                    </Field>
                    <Field id="co-address" label="Delivery Address" required>
                      <textarea id="co-address" name="address" value={form.address} onChange={handleChange} required rows={2} autoComplete="street-address" className={`${textareaCls}`} placeholder="House no., Street, City" />
                    </Field>
                    <Field id="co-notes" label="Order Notes" hint="optional">
                      <textarea id="co-notes" name="notes" value={form.notes} onChange={handleChange} rows={2} className={`${textareaCls}`} placeholder="Any special instructions..." />
                    </Field>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertIcon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="px-5 py-4 border-t border-gray-100 shrink-0 space-y-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isPending && <SpinnerIcon className="w-4 h-4 animate-spin" />}
                  {isPending ? 'Placing Order...' : `Place Order · ${formatCurrency(total, currency)}`}
                </button>
                {whatsappNumber && (
                  <p className="text-center text-xs text-gray-400">
                    After placing, you can also confirm via WhatsApp
                  </p>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ── Success view ──────────────────────────────────────────────
function SuccessView({ orderNumber, businessName, paymentMethod, paymentLabel, paymentAccountNumber, total, currency, whatsappNumber, onWhatsApp, onClose }: {
  orderNumber: string
  businessName: string
  paymentMethod: PaymentMethod
  paymentLabel: string
  paymentAccountNumber: string | null
  total: number
  currency: string
  whatsappNumber: string | null
  onWhatsApp: () => void
  onClose: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
        <CheckIcon className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Order Placed!</h2>
      <p className="text-sm text-gray-500">
        Received by <span className="font-semibold text-gray-700">{businessName}</span>
      </p>

      <div className="bg-gray-50 rounded-2xl px-6 py-4 my-5 w-full">
        <p className="text-xs text-gray-400 mb-1">Order Number</p>
        <p className="text-2xl font-bold text-indigo-600 tracking-widest mb-3">#{orderNumber}</p>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-500">Total:</span>
          <span className="font-bold text-gray-900">{formatCurrency(total, currency)}</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm mt-1">
          <span className="text-gray-500">Payment:</span>
          <span className="font-semibold text-gray-900">{paymentLabel}</span>
        </div>
        {paymentAccountNumber && paymentMethod !== 'cod' && (
          <div className="mt-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-left">
            <p className="text-xs text-gray-500 mb-1">Send payment to:</p>
            <p className="font-bold text-gray-900 text-base">{paymentAccountNumber}</p>
            <p className="text-xs text-gray-400 mt-1">Include your order number #{orderNumber} in the note</p>
          </div>
        )}
      </div>

      <div className="w-full space-y-2">
        {whatsappNumber && (
          <button
            onClick={onWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Confirm on WhatsApp
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────
const inputCls = 'w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
const textareaCls = 'w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white resize-none'

function Field({ id, label, required, hint, children }: {
  id: string; label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="text-gray-400 font-normal ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  )
}

// Icons
function XIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
}
function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
}
function AlertIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
}
function SpinnerIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
}
function WhatsAppIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}
