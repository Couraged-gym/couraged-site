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

export const TextLink = ({ to, children }) => (
  <Link to={to} className="font-semibold text-paper underline decoration-gold decoration-2 underline-offset-4 hover:text-gold">
    {children}
  </Link>
)
