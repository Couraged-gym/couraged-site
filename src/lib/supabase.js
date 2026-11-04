import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Read before the client consumes the URL: an expired or reused email link
// comes back as #error_description=... and we want to say so on screen.
const hash = new URLSearchParams(window.location.hash.slice(1))
export const linkError = hash.get('error_description')?.replace(/\+/g, ' ') ?? null

export const configured = Boolean(url && key)
// Implicit flow, so an email link opened on another phone or laptop still signs in
// (PKCE would need the browser that asked for the link).
export const supabase = configured
  ? createClient(url, key, { auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true } })
  : null

// Bump when the privacy notice changes; stored with each member's consent.
export const CONSENT_VERSION = 'privacy-2026-11-04'

// Supabase/Postgres messages that are safe and useful to show as they are.
export function message(error) {
  if (!error) return null
  const m = error.message ?? String(error)
  if (/could not find the function/i.test(m)) return 'The gym system is being updated. Try again in a few minutes.'
  if (/failed to fetch|network/i.test(m)) return 'No connection. Check your internet and try again.'
  if (/invalid login credentials/i.test(m)) return 'Wrong email or password.'
  if (/email not confirmed/i.test(m)) return 'Confirm your email first. We sent you a link when you signed up.'
  if (/rate limit|too many/i.test(m) && !/Too many tries/.test(m)) return 'Too many attempts. Wait a few minutes and try again.'
  if (/should be different/i.test(m)) return 'Pick a password you have not used here before.'
  if (/weak|pwned|leaked/i.test(m)) return 'That password is too easy to guess. Try a longer one.'
  return m
}
