import { createServerSupabaseClient } from './server'
import { redirect } from 'next/navigation'

/**
 * Get the current session from Supabase
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  return session
}

/**
 * Get the current authenticated user
 */
export async function getUser() {
  const session = await getSession()
  return session?.user || null
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 */
export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/sign-in')
  }
  return user
}

/**
 * Require super admin access - redirects if not a super admin
 */
export async function requireSuperAdmin() {
  const user = await requireAuth()
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',') || []
  const email = user.email

  if (!email || !superAdminEmails.includes(email)) {
    redirect('/')
  }

  return user
}

/**
 * Check if the current user is a super admin
 * Returns true/false without redirecting
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getUser()
  if (!user) return false

  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',') || []
  const email = user.email

  return !!(email && superAdminEmails.includes(email))
}

/**
 * Get user ID from session
 */
export async function getUserId(): Promise<string | null> {
  const user = await getUser()
  return user?.id || null
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
}
