import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      {/* DashboardNav renders: fixed sidebar (w-64) + fixed topbar (h-14) */}
      <DashboardNav />

      {/* Content: offset for fixed topbar (pt-14) and sidebar on desktop (lg:pl-64) */}
      <div className="pt-14 lg:pl-64 min-h-screen">
        <main className="min-h-full">
          {children}
        </main>
      </div>
    </div>
  )
}
