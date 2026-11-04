import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Read before the client consumes the URL: an expired or reused email link
// comes back as #error_description=... and we want to say so on screen.
const hash = new URLSearchParams(window.location.hash.slice(1))
const rawLinkError = hash.get('error_description')?.replace(/\+/g, ' ') ?? null
// True when an email link was opened too late or a second time (Supabase: otp_expired).
export const linkExpired = hash.get('error_code') === 'otp_expired' || /expired|invalid/i.test(rawLinkError ?? '')
export const linkError = linkExpired ? 'That email link has expired or was already used. Links work once, for one hour.' : rawLinkError
// 'invite' when a member opens the email the front desk sent from the POS.
export const linkType = hash.get('type')

// "Keep me signed in": the session lives in localStorage (stays after the browser closes)
// or sessionStorage (gone when it closes, for shared phones and computers). Default: remember.
const REMEMBER = 'cd-remember'
const safe = (fn, fallback = null) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}
export const remembers = () => safe(() => localStorage.getItem(REMEMBER) !== 'no', true)
export const setRemember = (on) => safe(() => localStorage.setItem(REMEMBER, on ? 'yes' : 'no'))
const storage = {
  getItem: (k) => safe(() => localStorage.getItem(k) ?? sessionStorage.getItem(k)),
  setItem: (k, v) =>
    safe(() => {
      const [keep, drop] = remembers() ? [localStorage, sessionStorage] : [sessionStorage, localStorage]
      drop.removeItem(k)
      keep.setItem(k, v)
    }),
  removeItem: (k) => safe(() => (localStorage.removeItem(k), sessionStorage.removeItem(k))),
}

export const configured = Boolean(url && key)
// Implicit flow, so an email link opened on another phone or laptop still signs in
// (PKCE would need the browser that asked for the link).
export const supabase = configured
  ? createClient(url, key, { auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true, storage } })
  : null

// Bump when the privacy notice changes; stored with each member's consent.
// Bump when the privacy notice changes; stored with each member's consent,
// together with their age declaration.
export const CONSENT_VERSION = 'privacy-2026-11-04;18+-or-guardian'

// Supabase/Postgres messages that are safe and useful to show as they are.
export function message(error) {
  if (!error) return null
  const m = error.message ?? String(error)
  if (/could not find the function/i.test(m)) return 'The gym system is being updated. Try again in a few minutes.'
  if (/failed to fetch|network/i.test(m)) return 'No connection. Check your internet and try again.'
  if (/invalid login credentials/i.test(m)) return 'Wrong email or password.'
  if (/email not confirmed/i.test(m)) return 'Confirm your email first. We sent you a link when you signed up.'
  const wait = m.match(/after (\d+) seconds?/i)
  if (wait) return `Wait ${wait[1]} seconds, then send it again.`
  if (/rate limit|too many/i.test(m) && !/Too many tries/.test(m)) return 'Too many emails or attempts. Wait a few minutes and try again.'
  if (/should be different/i.test(m)) return 'Pick a password you have not used here before.'
  if (/weak|pwned|leaked/i.test(m)) return 'That password is too easy to guess. Try a longer one.'
  return m
}
