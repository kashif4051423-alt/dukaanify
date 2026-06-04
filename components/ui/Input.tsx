import { cn } from '@/lib/utils/cn'
import { forwardRef } from 'react'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefix, suffix, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#f9fafb] mb-1.5">
            {label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}
        <div className={cn('relative flex items-center', prefix || suffix ? 'flex' : '')}>
          {prefix && (
            <div className="absolute left-3 text-[#6b7280] pointer-events-none">{prefix}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full border rounded-lg px-3.5 py-2.5 text-sm text-[#f9fafb] bg-[#0b0f19]',
              'placeholder:text-[#6b7280]',
              'transition-[border-color,box-shadow] duration-150',
              'outline-none',
              'focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgb(124_58_237/0.2)]',
              'disabled:bg-[#1f2937] disabled:text-[#6b7280] disabled:cursor-not-allowed',
              error ? 'border-red-600/50 focus:shadow-[0_0_0_3px_rgb(220_38_38/0.2)]' : 'border-[#1f2937]',
              prefix ? 'pl-9' : '',
              suffix ? 'pr-9' : '',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 text-[#6b7280]">{suffix}</div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-[#6b7280]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 bg-white resize-none',
            'placeholder:text-gray-400',
            'transition-[border-color,box-shadow] duration-150',
            'outline-none',
            'focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgb(99_102_241/0.12)]',
            'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
            error ? 'border-red-400' : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
