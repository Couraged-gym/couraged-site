import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import { BellRing, CalendarCheck, CreditCard, Expand, LogOut, ReceiptText, RefreshCw, ShieldCheck, Trash2, X } from 'lucide-react'
import { CONSENT_VERSION, message, supabase } from '../lib/supabase.js'
import { useAuth } from '../auth.jsx'
import { CountUp, EASE_OUT, StatusBadge, fmtDate } from '../components/ui.jsx'
import { AuthShell, Field, Notice, Submit, TextLink } from '../components/form.jsx'
import { GYM } from '../data/gym.js'

// Dates come from the database as Manila calendar days ('2026-11-26').
const manilaToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date())
const dayNo = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 864e5
const long = (iso) => fmtDate(`${iso}T00:00:00`, { month: 'short', day: 'numeric', year: 'numeric' })

export default function Pass() {
  const { session, member, memberError, refresh } = useAuth()
  if (session === null) return <Navigate to="/login" replace />
  if (memberError)
    return (
      <AuthShell title="Can't load your pass" lead={message(memberError)}>
        <button type="button" onClick={refresh} className="press rounded-lg bg-gold px-5 py-3 font-bold text-ink">
          Try again
        </button>
      </AuthShell>
    )
  if (member === undefined) return <PassSkeleton />
  if (member === null) return <Onboard />
  if (!member.consented) return <Consent />
  return <Card m={member} />
}

function PassSkeleton() {
  return (
    <main className="min-h-dvh bg-ink px-4 pt-20" aria-busy="true" aria-label="Loading your pass">
      <div className="mx-auto max-w-md animate-pulse space-y-4">
        <div className="h-10 w-40 rounded-md bg-paper/8" />
        <div className="aspect-[3/4] rounded-2xl bg-paper/8" />
      </div>
    </main>
  )
}

function Card({ m }) {
  const { session, signOut, refresh } = useAuth()
  const flash = useLocation().state?.flash
  const [big, setBig] = useState(false)
  const [token, setToken] = useState(m.qr_token)
  const [rotating, setRotating] = useState(false)

  const left = m.ends_on ? dayNo(m.ends_on) - dayNo(manilaToday()) : null
  const status = m.status === 'active' && left <= 5 ? 'expiring' : m.status
  const memberLeft = m.member_until ? dayNo(m.member_until) - dayNo(manilaToday()) : null

  const newQr = async () => {
    if (!confirm('Make a new QR code? The old one (and any screenshot of it) stops working at the door.')) return
    setRotating(true)
    const { data, error } = await supabase.rpc('member_new_qr')
    setRotating(false)
    if (error) return alert(message(error))
    setToken(data)
    refresh()
  }

  return (
    <main className="min-h-dvh bg-ink pb-[max(2rem,env(safe-area-inset-bottom))] text-paper">
      <div className="mx-auto max-w-md px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="flex h-12 items-center gap-2">
          <Link to="/" className="flex flex-1 items-center gap-2 rounded-md">
            <img src="/assets/logo.jpg" alt="" className="size-9 mix-blend-lighten" />
            <span className="font-display text-lg font-extrabold uppercase tracking-[0.04em]">
              CourageD <span className="text-gold">Pass</span>
            </span>
          </Link>
          <button type="button" onClick={signOut} className="press flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ash ring-1 ring-paper/12 hover:text-paper">
            <LogOut className="size-4" aria-hidden="true" /> Sign out
          </button>
        </header>

        <motion.div initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.32, ease: EASE_OUT }}>
          {flash && <div className="mt-4"><Notice tone="ok">{flash}</Notice></div>}
          <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none">Hi, {m.full_name.split(' ')[0]}</h1>

          <section aria-label="Membership pass" className="mt-5 overflow-hidden rounded-2xl bg-paper text-ink shadow-[0_24px_48px_-20px_rgb(0_0_0/0.7)]">
            <div className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-2xl font-extrabold uppercase leading-tight">{m.full_name}</p>
                <p className="tabular text-sm font-semibold tracking-[0.06em] text-smoke">{m.code}</p>
              </div>
              <StatusBadge status={status} solid />
            </div>

            <button type="button" onClick={() => setBig(true)} className="group relative mx-auto block w-[78%] pb-2" aria-label="Enlarge QR code">
              {/* One layoutId owner at a time, so the code morphs between card and fullscreen. */}
              {big ? (
                <div className="aspect-square" />
              ) : (
                <motion.div layoutId="qr" transition={{ duration: 0.35, ease: EASE_OUT }} className="rounded-xl bg-paper">
                  <Qr value={token} />
                </motion.div>
              )}
              <span className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-smoke">
                <Expand className="size-3.5" aria-hidden="true" /> Tap to enlarge
              </span>
            </button>

            <div className="relative mt-2 border-t-2 border-dashed border-ink/15 px-4 py-3">
              <span aria-hidden="true" className="absolute -top-3 -left-3 size-6 rounded-full bg-ink" />
              <span aria-hidden="true" className="absolute -top-3 -right-3 size-6 rounded-full bg-ink" />
              <p className="text-center text-sm text-smoke">
                {status === 'new'
                  ? 'Show this at the front desk to buy your first plan.'
                  : status === 'expired'
                    ? 'Renew at the front desk to reactivate this pass.'
                    : 'Scan this at the front desk to check in.'}
              </p>
            </div>
          </section>

          {m.ends_on && (
            <section className="mt-4 rounded-2xl bg-ink-2 p-5 ring-1 ring-paper/5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="tabular font-display text-6xl font-black leading-none">
                    <CountUp value={Math.abs(left)} />
                  </p>
                  <p className="mt-1 font-semibold text-ash">{left < 0 ? 'days since it ended' : left === 0 ? 'last day today' : left === 1 ? 'day left' : 'days left'}</p>
                </div>
                <p className="text-right text-sm text-ash">
                  {m.plan_name}
                  <br />
                  <span className="font-semibold text-paper">
                    {left < 0 ? 'Ended' : 'Until'} {long(m.ends_on)}
                  </span>
                </p>
              </div>
            </section>
          )}

          <section className="mt-4 flex items-start gap-3 rounded-2xl bg-ink-2 p-5 ring-1 ring-paper/5">
            <CreditCard className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Pay online: coming soon</h2>
              <p className="mt-1 text-sm text-ash">For now, renew at the front desk with cash or GCash. They scan this pass, and your new end date shows here right away.</p>
            </div>
          </section>

          <Visits />

          <Payments />

          <dl className="mt-4 divide-y divide-paper/8 rounded-2xl bg-ink-2 px-5 ring-1 ring-paper/5">
            <Row label="Annual membership">
              {m.member_until ? (memberLeft >= 0 ? `Until ${long(m.member_until)}` : `Ended ${long(m.member_until)}`) : 'Not yet'}
            </Row>
            <Row label="Email">{session.user.email}</Row>
            <Row label="Mobile">{m.phone || '—'}</Row>
            <Row label="Member since">{long(m.joined)}</Row>
          </dl>
          <p className="mt-3 px-1 text-xs text-ash">To change your name or mobile number, ask the front desk.</p>

          <Reminders on={m.reminders} />

          <button
            type="button"
            onClick={newQr}
            disabled={rotating}
            className="press mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-ash ring-1 ring-paper/12 hover:text-paper disabled:opacity-60"
          >
            <RefreshCw className={`size-4 ${rotating ? 'animate-spin' : ''}`} aria-hidden="true" /> Shared a screenshot? Make a new QR code
          </button>
          <p className="mt-4 text-center text-xs text-ash">
            <Link to="/privacy" className="underline underline-offset-4">Privacy notice</Link> · <Link to="/reset" className="underline underline-offset-4">Change password</Link>
          </p>

          <DeleteAccount email={session.user.email} />
        </motion.div>
      </div>

      <AnimatePresence>
        {big && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-paper p-6"
            onClick={() => setBig(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <button type="button" aria-label="Close" className="press absolute top-[max(1rem,env(safe-area-inset-top))] right-4 grid size-11 place-items-center rounded-full bg-ink/8 text-ink">
              <X className="size-5" aria-hidden="true" />
            </button>
            <div className="w-full max-w-sm text-center text-ink">
              <motion.div layoutId="qr" transition={{ duration: 0.35, ease: EASE_OUT }} className="rounded-xl bg-paper">
                <Qr value={token} />
              </motion.div>
              <p className="mt-4 font-display text-3xl font-extrabold uppercase">{m.full_name}</p>
              <p className="text-smoke">Turn your screen brightness up for a faster scan.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

const Row = ({ label, children }) => (
  <div className="flex items-baseline justify-between gap-4 py-3.5 text-sm">
    <dt className="text-ash">{label}</dt>
    <dd className="min-w-0 truncate text-right font-semibold">{children}</dd>
  </div>
)

// Level M with a small logo reads faster on handheld scanners than H with a big one.
function Qr({ value }) {
  return (
    <QRCodeSVG
      value={value}
      size={512}
      level="M"
      marginSize={3}
      fgColor="#19171B"
      bgColor="#FFFFFF"
      imageSettings={{ src: '/assets/icon-192.png', width: 72, height: 72, excavate: true }}
      className="h-auto w-full"
      title="Your check-in QR code"
    />
  )
}

// Signed in, but no gym record on this account yet.
function Onboard() {
  const { refresh, signOut } = useAuth()
  const [mode, setMode] = useState('link')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (!f.get('adult')) return setError('Members under 18 need a parent or guardian to agree. Tick the age box once they do.')
    if (!f.get('consent')) return setError('Tick the box to agree to the privacy notice.')
    setBusy(true)
    setError(null)
    const { data, error } =
      mode === 'link'
        ? await supabase.rpc('member_link', { p_code: f.get('code'), p_phone: f.get('phone'), p_consent: CONSENT_VERSION })
        : await supabase.rpc('member_join', { p_full_name: f.get('name'), p_phone: f.get('phone'), p_consent: CONSENT_VERSION })
    setBusy(false)
    if (error) return setError(message(error))
    if (!data) return setError(`That gym code and mobile number don't match a member we can link. Check both, or ask the front desk (${GYM.phone}).`)
    refresh()
  }

  return (
    <AuthShell
      title="Set up your pass"
      lead="Your email is confirmed. One last step."
      footer={
        <button type="button" onClick={signOut} className="font-semibold text-paper underline decoration-gold decoration-2 underline-offset-4">
          Sign out
        </button>
      }
    >
      <div role="tablist" aria-label="Are you already a member?" className="grid grid-cols-2 rounded-full bg-ink-2 p-1 ring-1 ring-paper/8">
        {[
          ['link', "I'm a member"],
          ['join', "I'm new"],
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={mode === k}
            onClick={() => (setMode(k), setError(null))}
            className="relative rounded-full py-2.5 text-sm font-bold uppercase tracking-[0.08em]"
          >
            {mode === k && <motion.span layoutId="onboard-pill" className="absolute inset-0 rounded-full bg-gold" transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }} />}
            <span className={`relative transition-colors duration-150 ${mode === k ? 'text-ink' : 'text-ash'}`}>{label}</span>
          </button>
        ))}
      </div>

      <form key={mode} onSubmit={submit} className="mt-6 space-y-4">
        {mode === 'link' ? (
          <>
            <p className="text-sm text-ash">Use the gym code on your card or receipt and the mobile number the front desk has for you.</p>
            <Field label="Gym code" name="code" placeholder="CRDFH26-0012" autoCapitalize="characters" autoComplete="off" spellCheck={false} required />
          </>
        ) : (
          <Field label="Full name" name="name" autoComplete="name" maxLength={80} required />
        )}
        <Field label="Mobile number" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0917 123 4567" required />
        <label className="flex gap-3 text-sm text-ash">
          <input type="checkbox" name="adult" className="mt-0.5 size-5 shrink-0 accent-gold" />
          <span>I'm 18 or older, or my parent or guardian agrees to this membership.</span>
        </label>
        <label className="flex gap-3 text-sm text-ash">
          <input type="checkbox" name="consent" className="mt-0.5 size-5 shrink-0 accent-gold" />
          <span>
            I agree to the <TextLink to="/privacy">privacy notice</TextLink>: CourageD keeps my name, email, mobile number and visits to run my membership.
          </span>
        </label>
        <Notice>{error}</Notice>
        <Submit busy={busy}>{mode === 'link' ? 'Link my membership' : 'Create my pass'}</Submit>
        <p className="flex items-center justify-center gap-1.5 text-xs text-ash">
          <ShieldCheck className="size-4 text-gold" aria-hidden="true" /> Only the front desk can see your details.
        </p>
      </form>
    </AuthShell>
  )
}

// Check-ins logged by the front desk scanner (POS patch 019).
function Visits() {
  const [visits, setVisits] = useState(null)
  useEffect(() => {
    supabase.rpc('member_visits').then(({ data, error }) => setVisits(error ? [] : data))
  }, [])
  const today = manilaToday()
  const dayOf = (t) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date(t))
  const month = visits?.filter((v) => dayOf(v.checked_at).slice(0, 7) === today.slice(0, 7)).length ?? 0
  const label = (t) => {
    const d = dayNo(today) - dayNo(dayOf(t))
    return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : fmtDate(t, { timeZone: 'Asia/Manila', weekday: 'short', month: 'short', day: 'numeric' })
  }
  return (
    <section className="mt-4 rounded-2xl bg-ink-2 p-5 ring-1 ring-paper/5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-extrabold uppercase">Recent visits</h2>
        {visits?.length > 0 && (
          <p className="tabular text-sm text-ash">
            <span className="font-bold text-gold">{month}</span> this month
          </p>
        )}
      </div>
      {!visits && <div className="mt-4 h-16 animate-pulse rounded-lg bg-paper/5" aria-label="Loading visits" />}
      {visits?.length === 0 && <p className="mt-3 text-ash">No visits yet. Your first check-in will show up here.</p>}
      <ol className="mt-2 divide-y divide-paper/8">
        {visits?.slice(0, 8).map((v, k) => (
          <motion.li
            key={v.checked_at}
            className="flex items-center gap-3 py-2.5"
            initial={{ opacity: 0, transform: 'translateX(-8px)' }}
            animate={{ opacity: 1, transform: 'translateX(0px)' }}
            transition={{ duration: 0.25, delay: k * 0.04, ease: EASE_OUT }}
          >
            <CalendarCheck className="size-4 text-gold" aria-hidden="true" />
            <span className="flex-1 font-semibold">{label(v.checked_at)}</span>
            <span className="tabular text-ash">{new Date(v.checked_at).toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' })}</span>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}

// Members invited from the POS: their record is linked, but they haven't agreed to the privacy notice yet.
function Consent() {
  const { refresh, signOut } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const submit = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (!f.get('adult')) return setError('Members under 18 need a parent or guardian to agree. Tick the age box once they do.')
    if (!f.get('consent')) return setError('Tick the box to agree to the privacy notice.')
    setBusy(true)
    const { error } = await supabase.rpc('member_consent', { p_consent: CONSENT_VERSION })
    setBusy(false)
    if (error) return setError(message(error))
    refresh()
  }
  return (
    <AuthShell
      title="One last step"
      lead="Before we show your pass, please read how we look after your details."
      footer={
        <button type="button" onClick={signOut} className="font-semibold text-paper underline decoration-gold decoration-2 underline-offset-4">
          Sign out
        </button>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="flex gap-3 text-sm text-ash">
          <input type="checkbox" name="adult" className="mt-0.5 size-5 shrink-0 accent-gold" />
          <span>I'm 18 or older, or my parent or guardian agrees to this membership.</span>
        </label>
        <label className="flex gap-3 text-sm text-ash">
          <input type="checkbox" name="consent" className="mt-0.5 size-5 shrink-0 accent-gold" />
          <span>
            I agree to the <TextLink to="/privacy">privacy notice</TextLink>: CourageD keeps my name, email, mobile number and visits to run my membership.
          </span>
        </label>
        <Notice>{error}</Notice>
        <Submit busy={busy}>Show my pass</Submit>
      </form>
    </AuthShell>
  )
}

const peso = (n) => '₱' + Number(n).toLocaleString('en-PH', { maximumFractionDigits: 2 })
const METHOD = { cash: 'Cash', gcash: 'GCash', card: 'Card' }

// Every plan paid, newest first, with the receipt number the front desk can look up.
function Payments() {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    supabase.rpc('member_payments').then(({ data, error }) => setRows(error ? [] : data))
  }, [])
  return (
    <section className="mt-4 rounded-2xl bg-ink-2 p-5 ring-1 ring-paper/5">
      <h2 className="font-display text-2xl font-extrabold uppercase">Payments</h2>
      {!rows && <div className="mt-4 h-16 animate-pulse rounded-lg bg-paper/5" aria-label="Loading payments" />}
      {rows?.length === 0 && <p className="mt-3 text-ash">No payments yet. Plans you buy at the front desk show up here.</p>}
      <ol className="mt-2 divide-y divide-paper/8">
        {rows?.map((p, k) => (
          <li key={k} className={`flex items-start gap-3 py-3 ${p.voided ? 'opacity-60' : ''}`}>
            <ReceiptText className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className={`font-semibold ${p.voided ? 'line-through' : ''}`}>{p.plan_name}</p>
              <p className="tabular text-sm text-ash">
                {long(p.starts_on)} – {long(p.ends_on)}
              </p>
              <p className="tabular text-xs text-ash">
                {p.voided
                  ? 'Cancelled at the front desk'
                  : p.sale_no
                    ? `Receipt #${String(p.sale_no).padStart(5, '0')} · ${long(p.paid_on)} · ${METHOD[p.payment_method] ?? p.payment_method}`
                    : 'Paid before the online system'}
              </p>
            </div>
            {p.amount != null && <p className={`tabular shrink-0 font-semibold ${p.voided ? 'line-through' : ''}`}>{peso(p.amount)}</p>}
          </li>
        ))}
      </ol>
    </section>
  )
}

function Reminders({ on: initial }) {
  const [on, setOn] = useState(initial !== false)
  const [busy, setBusy] = useState(false)
  const toggle = async () => {
    const next = !on
    setOn(next) // optimistic; put back if it fails
    setBusy(true)
    const { error } = await supabase.rpc('member_set_reminders', { p_on: next })
    setBusy(false)
    if (error) setOn(!next)
  }
  return (
    <div className="mt-4 flex items-center gap-4 rounded-2xl bg-ink-2 p-5 ring-1 ring-paper/5">
      <BellRing className="size-5 shrink-0 text-gold" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p id="rem-label" className="font-semibold">Renewal reminders</p>
        <p className="text-sm text-ash">An email 3 days before your plan ends, and one the day after.</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby="rem-label"
        disabled={busy}
        onClick={toggle}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200 ${on ? 'bg-gold' : 'bg-paper/15'}`}
      >
        <span className={`absolute top-1 left-1 size-6 rounded-full bg-paper shadow transition-transform duration-200 ease-[var(--ease-out)] ${on ? 'translate-x-6' : ''}`} />
      </button>
    </div>
  )
}

// Removes the login; the gym keeps the membership and payment records it must keep.
function DeleteAccount({ email }) {
  const { signOut } = useAuth()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const go = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.rpc('member_delete_account')
    if (error) return setBusy(false), setError(message(error))
    await signOut().catch(() => {})
    nav('/', { replace: true })
  }
  return (
    <section className="mt-10 border-t border-paper/10 pt-6">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="mx-auto flex items-center gap-2 text-sm font-semibold text-ash hover:text-[#FF9AA8]">
          <Trash2 className="size-4" aria-hidden="true" /> Delete my online account
        </button>
      ) : (
        <motion.form
          onSubmit={go}
          initial={{ opacity: 0, transform: 'translateY(6px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="space-y-4 rounded-2xl p-5 ring-1 ring-crimson/50"
        >
          <h2 className="font-display text-2xl font-extrabold uppercase">Delete online account?</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ash">
            <li>Your login, email and this QR pass are removed. You can sign up again later.</li>
            <li>Your gym membership itself stays: the front desk can still check you in with your gym code.</li>
            <li>Payment and membership records stay as long as tax rules require.</li>
          </ul>
          <Field label="Type your email to confirm" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />
          <Notice>{error}</Notice>
          <div className="flex gap-3">
            <button type="button" onClick={() => (setOpen(false), setTyped(''))} className="press h-12 flex-1 rounded-lg font-semibold ring-1 ring-paper/15">
              Keep it
            </button>
            <button
              type="submit"
              disabled={busy || typed.trim().toLowerCase() !== email.toLowerCase()}
              className="press h-12 flex-1 rounded-lg bg-crimson font-display text-lg font-extrabold uppercase tracking-[0.04em] text-paper disabled:opacity-40"
            >
              {busy ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </motion.form>
      )}
    </section>
  )
}
