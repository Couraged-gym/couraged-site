import { useId, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { CircleAlert, CircleCheck, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { EASE_OUT } from './ui.jsx'

// Dark, centered page for sign-in, sign-up, reset and onboarding.
export function AuthShell({ title, lead, children, footer }) {
  return (
    <main className="min-h-dvh bg-ink px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] text-paper">
      <div className="mx-auto max-w-sm">
        <header className="flex h-14 items-center">
          <Link to="/" className="flex items-center gap-2 rounded-md">
            <img src="/assets/logo.jpg" alt="" className="size-9 mix-blend-lighten" />
            <span className="font-display text-lg font-extrabold uppercase tracking-[0.04em]">
              CourageD <span className="text-gold">Fitness Hub</span>
            </span>
          </Link>
        </header>
        <motion.div
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.32, ease: EASE_OUT }}
          className="pt-8"
        >
          <h1 className="font-display text-5xl font-black uppercase leading-[0.9] text-balance">{title}</h1>
          {lead && <p className="mt-3 text-ash text-pretty">{lead}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t border-paper/10 pt-6 text-sm text-ash">{footer}</div>}
        </motion.div>
      </div>
    </main>
  )
}

export function Field({ label, hint, type = 'text', ...props }) {
  const id = useId()
  const [shown, setShown] = useState(false)
  const secret = type === 'password'
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={secret && shown ? 'text' : type}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={`h-12 w-full rounded-lg bg-ink-2 px-3.5 text-base text-paper ring-1 ring-paper/12 transition-shadow duration-150 placeholder:text-ash/60 focus:ring-2 focus:ring-gold focus:outline-none ${secret ? 'pr-12' : ''}`}
          {...props}
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            aria-pressed={shown}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-lg text-ash hover:text-paper"
          >
            {shown ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
          </button>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ash">
          {hint}
        </p>
      )}
    </div>
  )
}

export function Submit({ busy, children, className = '' }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={`press flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gold font-display text-lg font-extrabold uppercase tracking-[0.06em] text-ink disabled:opacity-70 ${className}`}
    >
      {busy && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

// One line of feedback under a form. Announced to screen readers.
export function Notice({ tone = 'error', children }) {
  const Icon = tone === 'error' ? CircleAlert : CircleCheck
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} aria-live="polite">
      <AnimatePresence initial={false}>
        {children && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className={`flex gap-2 rounded-lg px-3.5 py-3 text-sm ${tone === 'error' ? 'bg-crimson/15 text-[#FF9AA8]' : 'bg-active/15 text-[#7EE2A8]'}`}
          >
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{children}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// What a member types after the fixed CRDFH: "26-0012", "260012" or the whole code all work.
export const gymCode = (typed) => {
  const t = String(typed ?? '').toUpperCase().replace(/\s/g, '').replace(/^CRDFH-?/, '')
  const m = t.match(/^(\d{2})-?(\d+)$/)
  return m ? `CRDFH${m[1]}-${m[2]}` : `CRDFH${t}`
}

export function CodeField({ label = 'Gym code', hint = 'On your gym card or receipt, e.g. CRDFH26-0012. Just type the numbers.', ...props }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <div className="mt-1.5 flex h-12 overflow-hidden rounded-lg bg-ink-2 ring-1 ring-paper/12 transition-shadow duration-150 focus-within:ring-2 focus-within:ring-gold">
        <span className="tabular grid place-items-center bg-paper/6 px-3.5 font-semibold text-ash" aria-hidden="true">
          CRDFH
        </span>
        <input
          id={id}
          name="code"
          required
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          placeholder="26-0012"
          aria-describedby={`${id}-hint`}
          className="tabular min-w-0 flex-1 bg-transparent px-3 text-base text-paper placeholder:text-ash/60 focus:outline-none"
          {...props}
        />
      </div>
      <p id={`${id}-hint`} className="mt-1.5 text-xs text-ash">
        {hint}
      </p>
    </div>
  )
}

// On/off switch row. Optimistic: flips at once, flips back if saving fails.
export function Toggle({ Icon, label, children, on: initial, save }) {
  const id = useId()
  const [on, setOn] = useState(Boolean(initial))
  const [busy, setBusy] = useState(false)
  const flip = async () => {
    const next = !on
    setOn(next)
    setBusy(true)
    const ok = await save(next)
    setBusy(false)
    if (!ok) setOn(!next)
  }
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-ink-2 p-5 ring-1 ring-paper/5">
      {Icon && <Icon className="size-5 shrink-0 text-gold" aria-hidden="true" />}
      <div className="min-w-0 flex-1">
        <p id={id} className="font-semibold">{label}</p>
        <p className="text-sm text-ash">{children}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={id}
        disabled={busy}
        onClick={flip}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200 ${on ? 'bg-gold' : 'bg-paper/15'}`}
      >
        <span className={`absolute top-1 left-1 size-6 rounded-full bg-paper shadow transition-transform duration-200 ease-[var(--ease-out)] ${on ? 'translate-x-6' : ''}`} />
      </button>
    </div>
  )
}

export const TextLink = ({ to, children }) => (
  <Link to={to} className="font-semibold text-paper underline decoration-gold decoration-2 underline-offset-4 hover:text-gold">
    {children}
  </Link>
)
