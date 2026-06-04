// Admin email is set in .env.local as ADMIN_EMAIL
// Change it to your actual email address

export function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  const adminEmail = process.env.ADMIN_EMAIL ?? ''
  return email.toLowerCase() === adminEmail.toLowerCase()
}
