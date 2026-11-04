import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { MailCheck } from 'lucide-react'
import { linkError, message, supabase } from '../lib/supabase.js'
import { useAuth } from '../auth.jsx'
import { AuthShell, Field, Notice, Submit, TextLink } from '../components/form.jsx'

const origin = () => window.location.origin
const MIN = 8

function useForm() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const run = (fn) => async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await fn(new FormData(e.currentTarget))
    } catch (err) {
      setError(message(err))
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, setError, run }
}

const check = (r) => {
  if (r.error) throw r.error
  return r.data
}

export function SignIn() {
  const { session } = useAuth()
  const { busy, error, run } = useForm()
  const [unconfirmed, setUnconfirmed] = useState(null)
  const [resent, setResent] = useState(false)
  if (session) return <Navigate to="/pass" replace />

  const submit = run(async (f) => {
    const email = String(f.get('email')).trim()
    const r = await supabase.auth.signInWithPassword({ email, password: String(f.get('password')) })
    setUnconfirmed(/email not confirmed/i.test(r.error?.message ?? '') ? email : null)
    check(r)
  })
  const resend = async () => {
    await supabase.auth.resend({ type: 'signup', email: unconfirmed, options: { emailRedirectTo: `${origin()}/pass` } })
    setResent(true)
  }

  return (
    <AuthShell
      title="Sign in"
      lead="Your pass, your plan and your gym code, in one place."
      footer={
        <>
          New here? <TextLink to="/signup">Create an account</TextLink>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Notice>{linkError}</Notice>
        <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" required />
        <Notice>{error}</Notice>
        {unconfirmed && (
          <button type="button" onClick={resend} disabled={resent} className="text-sm font-semibold text-gold underline underline-offset-4 disabled:no-underline disabled:opacity-70">
            {resent ? 'Sent. Check your inbox and spam folder.' : 'Send the confirmation email again'}
          </button>
        )}
        <Submit busy={busy}>Sign in</Submit>
        <p className="text-center text-sm">
          <TextLink to="/forgot">Forgot your password?</TextLink>
        </p>
      </form>
    </AuthShell>
  )
}

export function SignUp() {
  const { session } = useAuth()
  const { busy, error, setError, run } = useForm()
  const [sentTo, setSentTo] = useState(null)
  if (session) return <Navigate to="/pass" replace />
  if (sentTo) return <CheckEmail email={sentTo} what="confirm your email and finish setting up your pass" />

  const submit = run(async (f) => {
    const email = String(f.get('email')).trim()
    const password = String(f.get('password'))
    if (password.length < MIN) return setError(`Use at least ${MIN} characters for your password.`)
    if (password !== f.get('confirm')) return setError('The two passwords do not match.')
    check(
      await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${origin()}/pass`, data: { account: 'member' } },
      }),
    )
    // Same screen whether or not the email was already registered, so this form can't be used to look up accounts.
    setSentTo(email)
  })

  return (
    <AuthShell
      title="Get your pass"
      lead="Already a member at the front desk? Sign up with your email, then link your gym code. New to CourageD? Same first step."
      footer={
        <>
          Have an account? <TextLink to="/login">Sign in</TextLink>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" required />
        <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={MIN} hint={`At least ${MIN} characters. A short phrase is easier to remember.`} required />
        <Field label="Password again" name="confirm" type="password" autoComplete="new-password" minLength={MIN} required />
        <Notice>{error}</Notice>
        <Submit busy={busy}>Create account</Submit>
      </form>
    </AuthShell>
  )
}

export function Forgot() {
  const { busy, error, run } = useForm()
  const [sentTo, setSentTo] = useState(null)
  if (sentTo) return <CheckEmail email={sentTo} what="set a new password" generic />

  const submit = run(async (f) => {
    const email = String(f.get('email')).trim()
    check(await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin()}/reset` }))
    setSentTo(email)
  })

  return (
    <AuthShell
      title="Reset password"
      lead="Enter the email you signed up with and we'll send you a link."
      footer={
        <>
          Remembered it? <TextLink to="/login">Sign in</TextLink>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" required />
        <Notice>{error}</Notice>
        <Submit busy={busy}>Send reset link</Submit>
      </form>
    </AuthShell>
  )
}

// Landing page of the reset email. The link signs them in for this one purpose.
export function Reset() {
  const { session } = useAuth()
  const nav = useNavigate()
  const { busy, error, setError, run } = useForm()

  if (session === undefined) return <AuthShell title="One moment" />
  if (!session)
    return (
      <AuthShell title="Link expired" lead={linkError ?? 'This reset link has expired or was already used. Links work once, for one hour.'}>
        <TextLink to="/forgot">Send a new link</TextLink>
      </AuthShell>
    )

  const submit = run(async (f) => {
    const password = String(f.get('password'))
    if (password.length < MIN) return setError(`Use at least ${MIN} characters for your password.`)
    if (password !== f.get('confirm')) return setError('The two passwords do not match.')
    check(await supabase.auth.updateUser({ password }))
    nav('/pass', { replace: true, state: { flash: 'Password changed.' } })
  })

  return (
    <AuthShell title="New password" lead={`For ${session.user.email}.`}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="New password" name="password" type="password" autoComplete="new-password" minLength={MIN} hint={`At least ${MIN} characters.`} required />
        <Field label="New password again" name="confirm" type="password" autoComplete="new-password" minLength={MIN} required />
        <Notice>{error}</Notice>
        <Submit busy={busy}>Save password</Submit>
      </form>
    </AuthShell>
  )
}

function CheckEmail({ email, what, generic }) {
  return (
    <AuthShell
      title="Check your email"
      footer={
        <>
          Wrong address? <TextLink to={generic ? '/forgot' : '/signup'}>Start again</TextLink>
        </>
      }
    >
      <div className="flex gap-4 rounded-xl bg-ink-2 p-5 ring-1 ring-paper/8">
        <MailCheck className="mt-0.5 size-6 shrink-0 text-gold" aria-hidden="true" />
        <p className="text-pretty">
          {generic ? 'If ' : 'We sent a link to '}
          <strong className="break-all text-paper">{email}</strong>
          {generic ? ' has an account, we sent it a link to ' : '. Open it on this phone or any device to '}
          {what}. It can take a minute; check spam too.
        </p>
      </div>
    </AuthShell>
  )
}
