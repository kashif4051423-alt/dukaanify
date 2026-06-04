/**
 * Simple env accessors — no eager validation.
 * process.env values are inlined by Next.js at build time for NEXT_PUBLIC_ vars.
 */

export const env = {
  supabaseUrl:        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey:    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  appUrl:             process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
}
