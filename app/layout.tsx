import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryClientProvider } from '@/components/providers/QueryClientProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Dukaanify — آپ کے کاروبار کا ساتھی',
    template: '%s — Dukaanify',
  },
  description: 'Dukaanify - اپنے دکان، مصنوعات اور آرڈرز کو manage کریں۔ سادہ، طاقتور، اور مفت۔',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'Dukaanify',
    description: 'آپ کے کاروبار کو آسان بنائیں',
    images: [{ url: '/logo.svg' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6366f1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ur" className={inter.variable}>
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className="font-sans antialiased bg-[#0B0F19] text-[#F9FAFB]">
        <QueryClientProvider>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  )
}
