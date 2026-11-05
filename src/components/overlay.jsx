import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'motion/react'
import { Check, ChevronDown, CircleAlert, CircleCheck } from 'lucide-react'

// iOS-like drawer curve; exits are shorter and accelerate away.
const DRAWER = [0.32, 0.72, 0, 1]
const EXIT = [0.4, 0, 1, 1]

// Bottom sheet drawn by the app, in place of the phone's own select / alert /
// confirm pop-ups. Drag the handle down (or flick it) to close; Esc and the
// backdrop close it too. Focus moves in and returns to the trigger.
export function Sheet({ open, onClose, title, children }) {
  const id = useId()
  const panel = useRef(null)
  const drag = useDragControls()
  const reduce = useReducedMotion()
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    if (!open) return
    const back = document.activeElement
    const onKey = (e) => e.key === 'Escape' && close.current()
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const raf = requestAnimationFrame(() => panel.current?.querySelector('[data-autofocus]')?.focus() ?? panel.current?.focus())
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      back?.focus?.({ preventScroll: true })
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-black/60"
            onClick={() => close.current()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={{ duration: 0.24 }}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[85dvh] max-w-md flex-col rounded-t-3xl bg-ink-2 text-paper shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.55)] ring-1 ring-paper/10 focus:outline-none"
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '100%', transition: { duration: 0.2, ease: EXIT } }}
            transition={{ duration: 0.34, ease: DRAWER }}
            drag={reduce ? false : 'y'}
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.7 }}
            onDragEnd={(_, i) => (i.offset.y > 80 || i.velocity.y > 450) && close.current()}
          >
            {/* Only the header drags, so the list inside can still scroll. */}
            <div onPointerDown={(e) => drag.start(e)} className="shrink-0 cursor-grab touch-none px-5 pt-2.5 pb-3 active:cursor-grabbing">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-paper/20" aria-hidden="true" />
              <h2 id={id} className="mt-3 font-display text-2xl font-extrabold uppercase leading-tight">
                {title}
              </h2>
            </div>
            <div className="overflow-y-auto overscroll-contain px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// A select that opens a sheet of options instead of the OS picker wheel.
export function Picker({ label, value, options, onChange }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)
  return (
    <div>
      <span id={id} className="block text-sm font-semibold">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-labelledby={id}
        aria-describedby={`${id}-v`}
        onClick={() => setOpen(true)}
        className="press mt-1.5 flex h-12 w-full items-center gap-2 rounded-lg bg-ink-2 px-3.5 text-left text-base ring-1 ring-paper/12 transition-shadow duration-150 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
      >
        <span id={`${id}-v`} className="min-w-0 flex-1 truncate font-semibold">
          {current?.label ?? 'Choose'}
        </span>
        <ChevronDown className="size-5 shrink-0 text-ash" aria-hidden="true" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <ul role="listbox" aria-label={label}>
          {options.map((o) => {
            const on = o.value === value
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  data-autofocus={on || undefined}
                  onClick={() => (onChange(o.value), setOpen(false))}
                  className={`flex min-h-13 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-150 active:bg-paper/8 ${on ? 'bg-gold/10 text-gold' : ''}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{o.label}</span>
                    {o.hint && <span className="tabular block text-xs text-ash">{o.hint}</span>}
                  </span>
                  {on && <Check className="size-5 shrink-0" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      </Sheet>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ask() and toast(): call from anywhere; <OverlayHost /> renders them once.
// ---------------------------------------------------------------------------
let state = { dialog: null, toasts: [] }
const subs = new Set()
const emit = (patch) => {
  state = { ...state, ...patch }
  subs.forEach((f) => f())
}

// Resolves true on confirm, false on cancel / dismiss.
export const ask = ({ title, body, confirm = 'OK', cancel = 'Cancel', danger = false }) =>
  new Promise((resolve) => emit({ dialog: { title, body, confirm, cancel, danger, resolve } }))

let nextId = 0
const timers = new Map()
const dismiss = (id) => {
  clearTimeout(timers.get(id))
  timers.delete(id)
  emit({ toasts: state.toasts.filter((t) => t.id !== id) })
}
// tone: 'ok' | 'error'. action: { label, run } for Undo and the like.
export function toast(text, { tone = 'ok', action, duration = action ? 5000 : 3200 } = {}) {
  const id = ++nextId
  const kept = state.toasts.slice(-2)
  state.toasts.filter((t) => !kept.includes(t)).forEach((t) => clearTimeout(timers.get(t.id)))
  emit({ toasts: [...kept, { id, text, tone, action }] })
  timers.set(id, setTimeout(() => dismiss(id), duration))
}

export function OverlayHost() {
  const s = useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => state)
  const last = useRef(null)
  if (s.dialog) last.current = s.dialog // keep content on screen while the sheet slides away
  const d = last.current
  const answer = (v) => {
    s.dialog?.resolve(v)
    emit({ dialog: null })
  }
  return (
    <>
      <Sheet open={Boolean(s.dialog)} onClose={() => answer(false)} title={d?.title}>
        {d?.body && <p className="px-2 text-ash text-pretty">{d.body}</p>}
        <div className="mt-5 grid gap-2 px-2">
          <button
            type="button"
            data-autofocus
            onClick={() => answer(true)}
            className={`press h-12 rounded-lg font-display text-lg font-extrabold uppercase tracking-[0.06em] ${d?.danger ? 'bg-crimson text-paper' : 'bg-gold text-ink'}`}
          >
            {d?.confirm}
          </button>
          <button type="button" onClick={() => answer(false)} className="press h-12 rounded-lg font-semibold text-ash ring-1 ring-paper/12">
            {d?.cancel}
          </button>
        </div>
      </Sheet>

      {/* Above the tab bar; newest at the bottom, nearest the thumb. */}
      <ol aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[70] mx-auto flex max-w-md flex-col gap-2 px-4">
        <AnimatePresence initial={false}>
          {s.toasts.map((t) => (
            <motion.li
              key={t.id}
              layout
              role={t.tone === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15, ease: EXIT } }}
              transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
              className="pointer-events-auto flex min-h-12 items-center gap-3 rounded-xl bg-paper py-2 pr-2 pl-3.5 text-ink shadow-[0_12px_28px_-10px_rgb(0_0_0/0.6)]"
            >
              {t.tone === 'error' ? <CircleAlert className="size-5 shrink-0 text-crimson" aria-hidden="true" /> : <CircleCheck className="size-5 shrink-0 text-active" aria-hidden="true" />}
              <p className="min-w-0 flex-1 text-sm font-semibold">{t.text}</p>
              {t.action && (
                <button type="button" onClick={() => (dismiss(t.id), t.action.run())} className="press h-10 shrink-0 rounded-lg px-3 text-sm font-bold text-crimson">
                  {t.action.label}
                </button>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </>
  )
}
