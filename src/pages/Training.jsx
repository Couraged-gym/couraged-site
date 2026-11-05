import { useCallback, useEffect, useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, Copy, Dumbbell, Eye, Flame, Medal, Minus, Plus, Share2, ShieldCheck, Trash2, Trophy, UserMinus, UserPlus, X } from 'lucide-react'
import { message, supabase } from '../lib/supabase.js'
import { useAuth } from '../auth.jsx'
import { EASE_OUT, dayNo, fmtDate, long, manilaToday } from '../components/ui.jsx'
import { Field, Notice, Submit, Toggle } from '../components/form.jsx'
import { Picker, ask, toast } from '../components/overlay.jsx'

// 'K7PQ2M' -> 'K7P-Q2M'
const fmtFriendCode = (c) => (c ? `${c.slice(0, 3)}-${c.slice(3)}` : '')

const ago = (iso) => {
  const d = dayNo(manilaToday()) - dayNo(iso)
  return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : d < 14 ? `${d} days ago` : long(iso)
}
const set = (r) => `${+r.weight_kg} kg × ${r.reps}`

// The last 30 Manila days as picker options, newest first.
const isoMinus = (iso, n) => new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) - n)).toISOString().slice(0, 10)
const recentDays = () => {
  const today = manilaToday()
  return Array.from({ length: 30 }, (_, n) => {
    const iso = isoMinus(today, n)
    const date = fmtDate(`${iso}T00:00:00`, { weekday: 'short', month: 'short', day: 'numeric' })
    return { value: iso, label: n === 0 ? 'Today' : n === 1 ? 'Yesterday' : date, hint: n < 2 ? date : undefined }
  })
}

// One shared fetch of the exercise list for both tabs.
let exercisesP
const loadExercises = () =>
  (exercisesP ??= supabase
    .from('exercises')
    .select('id, name')
    .eq('is_active', true)
    .order('sort')
    .then(({ data, error }) => {
      if (error) throw ((exercisesP = null), error)
      return data
    }))
function useExercises() {
  const [list, setList] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    loadExercises().then(setList, (e) => setError(message(e)))
  }, [])
  return [list, error]
}

const Panel = ({ title, aside, children }) => (
  <section className="mt-4 rounded-2xl bg-ink-2 p-5 ring-1 ring-paper/5">
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="font-display text-2xl font-extrabold uppercase">{title}</h2>
      {aside}
    </div>
    {children}
  </section>
)
const Loading = ({ label }) => <div className="mt-4 h-16 animate-pulse rounded-lg bg-paper/5" aria-label={label} />
const enter = (k) => ({
  initial: { opacity: 0, transform: 'translateY(6px)' },
  animate: { opacity: 1, transform: 'translateY(0px)' },
  transition: { duration: 0.22, delay: Math.min(k, 8) * 0.035, ease: EASE_OUT },
})
const rise = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.28, ease: EASE_OUT } }

// Number field with − / + beside it: one thumb, no tiny OS spinner arrows.
function Stepper({ label, value, onChange, step, min, max, unit, decimals }) {
  const id = useId()
  const n = Number(value)
  const bump = (d) => {
    const next = Math.min(max, Math.max(min, (Number.isFinite(n) && value !== '' ? n : 0) + d))
    onChange(String(+next.toFixed(2)))
  }
  const btn = 'press grid size-12 shrink-0 place-items-center rounded-lg bg-paper/6 text-paper ring-1 ring-paper/10 active:bg-paper/12 disabled:opacity-40'
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <div className="mt-1.5 flex gap-1.5">
        <button type="button" onClick={() => bump(-step)} disabled={value === '' || n <= min} aria-label={`Less ${label.toLowerCase()}`} className={btn}>
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <div className="relative min-w-0 flex-1">
          <input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value.replace(decimals ? /[^\d.]/g : /\D/g, ''))}
            inputMode={decimals ? 'decimal' : 'numeric'}
            autoComplete="off"
            enterKeyHint="next"
            placeholder="0"
            required
            className="tabular h-12 w-full rounded-lg bg-ink-2 text-center font-display text-2xl font-black text-paper ring-1 ring-paper/12 transition-shadow duration-150 placeholder:text-ash/40 focus:ring-2 focus:ring-gold focus:outline-none"
          />
          {unit && <span className="pointer-events-none absolute inset-y-0 right-2.5 grid place-items-center text-xs font-semibold text-ash">{unit}</span>}
        </div>
        <button type="button" onClick={() => bump(step)} disabled={n >= max} aria-label={`More ${label.toLowerCase()}`} className={btn}>
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// The one showpiece: shards fly off the trophy when a set beats your best.
function Burst() {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-7">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        const r = i % 2 ? 30 : 46
        return (
          <motion.span
            key={i}
            className={`absolute -mt-1 -ml-1 size-2 rounded-[2px] ${i % 3 ? 'bg-ink' : 'bg-crimson'}`}
            initial={{ opacity: 1, transform: 'translate(0px, 0px) rotate(0deg) scale(1)' }}
            animate={{ opacity: 0, transform: `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r}px) rotate(${i * 40}deg) scale(0.5)` }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
          />
        )
      })}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Lifts: log a set, see PRs per exercise, browse history.
// ---------------------------------------------------------------------------
export function Lifts() {
  const [exercises, exError] = useExercises()
  const [prs, setPrs] = useState(null)
  const [history, setHistory] = useState(null)
  const [filter, setFilter] = useState(null) // exercise id, or null for all
  const [exercise, setExercise] = useState(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [day, setDay] = useState(manilaToday)
  const [days] = useState(recentDays)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(null) // { pr, text, key }

  const exId = exercise ?? exercises?.[0]?.id
  const load = useCallback(() => {
    supabase.rpc('my_prs').then(({ data, error }) => setPrs(error ? [] : data))
    supabase.rpc('my_lifts', { p_exercise_id: filter }).then(({ data, error }) => setHistory(error ? [] : data))
  }, [filter])
  useEffect(load, [load])

  const log = async (e) => {
    e.preventDefault()
    const w = Number(weight)
    const r = Number(reps)
    if (weight === '' || !Number.isFinite(w) || w < 0 || w > 1000) return setError('Enter the weight in kg, from 0 to 1000.')
    if (!Number.isInteger(r) || r < 1 || r > 100) return setError('Enter reps from 1 to 100.')
    const name = exercises.find((x) => x.id === exId)?.name
    setBusy(true)
    setError(null)
    const { data, error } = await supabase.rpc('lift_add', { p_exercise_id: exId, p_weight_kg: w, p_reps: r, p_lifted_on: day })
    setBusy(false)
    if (error) return setError(message(error))
    setDone({ pr: data.pr, text: `${name}: ${w} kg × ${r}`, key: data.id })
    load()
  }

  // Delete at once, offer Undo (re-logs the same set) instead of asking first.
  const remove = async (r) => {
    setHistory((h) => h.filter((x) => x.id !== r.id))
    const { error } = await supabase.rpc('lift_delete', { p_id: r.id })
    if (error) return toast(message(error), { tone: 'error' }), load()
    load()
    toast(`Deleted ${r.exercise} ${set(r)}`, {
      action: {
        label: 'Undo',
        run: async () => {
          const { error } = await supabase.rpc('lift_add', { p_exercise_id: r.exercise_id, p_weight_kg: r.weight_kg, p_reps: r.reps, p_lifted_on: r.lifted_on, p_note: r.note })
          if (error) toast(message(error), { tone: 'error' })
          load()
        },
      },
    })
  }

  return (
    <motion.div {...rise}>
      <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none">Lifts</h1>
      <p className="mt-2 text-ash">Log your sets. Beat your best and it counts as a PR.</p>

      <Panel title="Log a set">
        {exError && <p className="mt-3 text-ash">{exError}</p>}
        {!exercises && !exError && <Loading label="Loading exercises" />}
        {exercises && (
          <form onSubmit={log} className="mt-4 space-y-4" noValidate>
            <Picker label="Exercise" value={exId} onChange={setExercise} options={exercises.map((x) => ({ value: x.id, label: x.name }))} />
            <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 min-[380px]:gap-3">
              <Stepper label="Weight" unit="kg" value={weight} onChange={setWeight} step={2.5} min={0} max={1000} decimals />
              <Stepper label="Reps" value={reps} onChange={setReps} step={1} min={1} max={100} />
            </div>
            <Picker label="Date" value={day} onChange={setDay} options={days} />
            <Notice>{error}</Notice>
            <AnimatePresence mode="popLayout" initial={false}>
              {done && (
                <motion.div
                  key={done.key}
                  role="status"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
                  transition={done.pr ? { type: 'spring', duration: 0.45, bounce: 0.35 } : { duration: 0.2, ease: EASE_OUT }}
                  className={`relative flex items-center gap-3 rounded-lg px-4 py-3 ${done.pr ? 'bg-gold text-ink' : 'bg-active/15 text-[#7EE2A8]'}`}
                >
                  {done.pr && <Burst />}
                  {done.pr ? (
                    <motion.span initial={{ rotate: -18, scale: 0.7 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', duration: 0.5, bounce: 0.5 }}>
                      <Trophy className="size-7 shrink-0" aria-hidden="true" />
                    </motion.span>
                  ) : (
                    <Check className="size-5 shrink-0" aria-hidden="true" />
                  )}
                  <p className="text-sm">
                    <span className="block font-display text-xl font-black uppercase leading-none">{done.pr ? 'New PR!' : 'Logged'}</span>
                    {done.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <Submit busy={busy}>Log set</Submit>
          </form>
        )}
      </Panel>

      <Panel title="My PRs">
        {!prs && <Loading label="Loading PRs" />}
        {prs?.length === 0 && <p className="mt-3 text-ash">No sets yet. Your best for each lift shows up here.</p>}
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {prs?.map((p, k) => (
            <motion.li key={p.exercise_id} {...enter(k)}>
              <button
                type="button"
                aria-pressed={filter === p.exercise_id}
                onClick={() => setFilter((f) => (f === p.exercise_id ? null : p.exercise_id))}
                className={`press h-full w-full rounded-xl p-3 text-left ring-1 transition-colors duration-150 ${filter === p.exercise_id ? 'bg-gold/12 ring-gold' : 'bg-paper/4 ring-paper/8'}`}
              >
                <span className="block truncate text-sm text-ash">{p.exercise}</span>
                <span className="tabular block font-display text-2xl font-black leading-tight">{+p.weight_kg} kg</span>
                <span className="tabular block text-xs text-ash">
                  × {p.reps} · {ago(p.lifted_on)}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="History"
        aside={
          filter && (
            <button type="button" onClick={() => setFilter(null)} className="-my-2 flex h-11 items-center gap-1 px-1 text-sm font-semibold text-gold">
              <X className="size-4" aria-hidden="true" /> Show all
            </button>
          )
        }
      >
        {!history && <Loading label="Loading history" />}
        {history?.length === 0 && <p className="mt-3 text-ash">Nothing logged yet.</p>}
        <ol className="mt-2 divide-y divide-paper/8">
          <AnimatePresence initial={false}>
            {history?.map((r, k) => (
              <motion.li key={r.id} {...enter(k)} exit={{ opacity: 0, transition: { duration: 0.15 } }} className="flex items-center gap-3 py-2.5">
                <Dumbbell className="size-4 shrink-0 text-gold" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.exercise}</p>
                  <p className="tabular text-xs text-ash">{ago(r.lifted_on)}</p>
                </div>
                <span className="tabular font-semibold">{set(r)}</span>
                <button type="button" onClick={() => remove(r)} aria-label={`Delete ${r.exercise} ${set(r)}`} className="press -mr-2 grid size-11 place-items-center rounded-full text-ash active:text-[#FF9AA8]">
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      </Panel>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Friends: 18+ only. Add by friend code, requests, who trained today, leaderboard.
// ---------------------------------------------------------------------------
export function Friends({ m }) {
  // m.adult: undefined = database not updated yet (no age check), null = not answered.
  if (m.adult === null) return <AgeCheck />
  if (m.adult === false)
    return (
      <motion.div {...rise}>
        <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none">Friends</h1>
        <section className="mt-4 flex items-start gap-3 rounded-2xl bg-ink-2 p-5 ring-1 ring-paper/5">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
          <div>
            <h2 className="font-semibold">Friends is for members 18 and older</h2>
            <p className="mt-1 text-sm text-ash">You can still log your sets and track your PRs on the Lifts tab. They stay private to you. If you answered by mistake, ask the front desk.</p>
          </div>
        </section>
      </motion.div>
    )
  return <FriendsHub m={m} />
}

function AgeCheck() {
  const { refresh } = useAuth()
  const [busy, setBusy] = useState(null)
  const answer = async (adult) => {
    const ok = await ask(
      adult
        ? { title: "You're 18 or older?", body: 'Friends will be turned on for you. Only the front desk can change this later.', confirm: "Yes, I'm 18+" }
        : { title: "You're under 18?", body: "Friends will stay off for you. Lifts still work. Only the front desk can change this later.", confirm: "Yes, I'm under 18" },
    )
    if (!ok) return
    setBusy(adult)
    const { error } = await supabase.rpc('member_set_adult', { p_adult: adult })
    setBusy(null)
    if (error) return toast(message(error), { tone: 'error' })
    refresh()
  }
  return (
    <motion.div {...rise}>
      <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none">Friends</h1>
      <p className="mt-2 text-ash">Add gym friends, see who trained today, and compare lifts.</p>
      <section className="mt-4 rounded-2xl bg-ink-2 p-5 ring-1 ring-paper/5">
        <h2 className="font-display text-2xl font-extrabold uppercase">One quick check</h2>
        <p className="mt-1 text-sm text-ash">Friends is for members 18 and older. How old are you?</p>
        <div className="mt-4 grid gap-2">
          <button type="button" onClick={() => answer(true)} disabled={busy !== null} className="press h-12 rounded-lg bg-gold font-display text-lg font-extrabold uppercase tracking-[0.06em] text-ink disabled:opacity-60">
            I'm 18 or older
          </button>
          <button type="button" onClick={() => answer(false)} disabled={busy !== null} className="press h-12 rounded-lg font-semibold ring-1 ring-paper/15 disabled:opacity-60">
            I'm under 18
          </button>
        </div>
      </section>
    </motion.div>
  )
}

function FriendsHub({ m }) {
  const { refresh } = useAuth()
  const [people, setPeople] = useState(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(null)
  const [copied, setCopied] = useState(false)

  const load = useCallback(() => {
    supabase.rpc('my_friends').then(({ data, error }) => setPeople(error ? [] : data))
  }, [])
  useEffect(load, [load])

  const add = async (e) => {
    e.preventDefault()
    if (code.replace(/[^a-z0-9]/gi, '').length < 6) return setError('Friend codes have 6 letters and numbers, like K7P-Q2M.')
    setBusy(true)
    setError(null)
    setSent(null)
    const { data, error } = await supabase.rpc('friend_request', { p_code: code })
    setBusy(false)
    if (error) return setError(message(error))
    if (data.result === 'not_found') return setError('No member has that friend code. Check it with your friend and try again.')
    setCode('')
    setSent(
      data.result === 'accepted'
        ? `You and ${data.name} are now friends.`
        : data.result === 'already'
          ? `You and ${data.name} are already friends.`
          : "Request sent. They'll show up here once they accept.",
    )
    load()
  }

  const act = async (fn, args, done) => {
    const { error } = await supabase.rpc(fn, args)
    if (error) toast(message(error), { tone: 'error' })
    else if (done) toast(done)
    load()
  }
  const unfriend = async (p) => {
    const ok = await ask({ title: `Remove ${p.name}?`, body: "You'll stop seeing each other's visits and lifts. Either of you can add the other again later.", confirm: 'Remove friend', danger: true })
    if (ok) act('friend_remove', { p_member_id: p.member_id }, `Removed ${p.name}`)
  }

  const share = async () => {
    const text = `Add me as a friend on the CourageD app. My friend code: ${fmtFriendCode(m.friend_code)}`
    try {
      if (navigator.share) return await navigator.share({ text })
      await navigator.clipboard.writeText(fmtFriendCode(m.friend_code))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* share sheet dismissed */
    }
  }

  const saveSharing = (patch) => async (on) => {
    const { error } = await supabase.rpc('member_set_sharing', { p_visits: null, p_lifts: null, ...patch(on) })
    if (error) toast(message(error), { tone: 'error' })
    else refresh()
    return !error
  }

  const incoming = people?.filter((p) => p.state === 'incoming') ?? []
  const friends = people?.filter((p) => p.state === 'friend') ?? []
  const outgoing = people?.filter((p) => p.state === 'outgoing') ?? []
  const trainedToday = friends.filter((p) => p.trained_today).length

  return (
    <motion.div {...rise}>
      <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none">Friends</h1>
      <p className="mt-2 text-ash">Friends only see your first name and last initial, plus what you choose to share below.</p>

      <section className="mt-4 flex items-center gap-3 rounded-2xl bg-paper p-4 text-ink">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-smoke">Your friend code</p>
          <p className="tabular font-display text-3xl font-black tracking-[0.06em]">{fmtFriendCode(m.friend_code)}</p>
          <p className="text-xs text-smoke">Only for friends. Keep your gym code to yourself.</p>
        </div>
        <button type="button" onClick={share} className="press flex h-12 items-center gap-2 rounded-lg bg-ink px-4 font-semibold text-paper">
          {copied ? <Check className="size-4" aria-hidden="true" /> : navigator.share ? <Share2 className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          {copied ? 'Copied' : navigator.share ? 'Share' : 'Copy'}
        </button>
      </section>

      <Panel title="Add a friend">
        <form onSubmit={add} className="mt-4 space-y-4" noValidate>
          <Field
            label="Friend's code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="send"
            placeholder="K7P-Q2M"
            hint="On their Friends tab, at the top."
            className="tabular h-12 w-full rounded-lg bg-ink-2 px-3.5 font-display text-2xl font-black tracking-[0.12em] text-paper ring-1 ring-paper/12 transition-shadow duration-150 placeholder:text-ash/40 focus:ring-2 focus:ring-gold focus:outline-none"
          />
          <Notice>{error}</Notice>
          <Notice tone="ok">{sent}</Notice>
          <Submit busy={busy}>
            <UserPlus className="size-5" aria-hidden="true" /> Send request
          </Submit>
        </form>
      </Panel>

      <AnimatePresence initial={false}>
        {incoming.length > 0 && (
          <motion.div key="requests" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.24, ease: EASE_OUT }}>
            <Panel title="Requests" aside={<span className="tabular rounded-full bg-gold px-2.5 py-0.5 text-sm font-bold text-ink">{incoming.length}</span>}>
              <ul className="mt-2 divide-y divide-paper/8">
                {incoming.map((p, k) => (
                  <motion.li key={p.member_id} {...enter(k)} className="flex items-center gap-2 py-3">
                    <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
                    <button type="button" onClick={() => act('friend_respond', { p_member_id: p.member_id, p_accept: false }, 'Request declined')} className="press h-11 rounded-lg px-3 text-sm font-semibold text-ash ring-1 ring-paper/12">
                      Decline
                    </button>
                    <button type="button" onClick={() => act('friend_respond', { p_member_id: p.member_id, p_accept: true }, `You and ${p.name} are now friends`)} className="press h-11 rounded-lg bg-gold px-4 text-sm font-bold text-ink">
                      Accept
                    </button>
                  </motion.li>
                ))}
              </ul>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>

      <Panel
        title="My friends"
        aside={
          trainedToday > 0 && (
            <p className="tabular text-sm text-ash">
              <span className="font-bold text-gold">{trainedToday}</span> trained today
            </p>
          )
        }
      >
        {!people && <Loading label="Loading friends" />}
        {people && friends.length + outgoing.length === 0 && <p className="mt-3 text-ash">No friends yet. Share your code, or add a friend's code above.</p>}
        <ul className="mt-2 divide-y divide-paper/8">
          {friends.map((p, k) => (
            <motion.li key={p.member_id} {...enter(k)} className="flex items-center gap-3 py-3">
              <span className={`grid size-10 shrink-0 place-items-center rounded-full font-display text-lg font-black ${p.trained_today ? 'bg-gold text-ink' : 'bg-paper/8 text-paper'}`} aria-hidden="true">
                {p.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.name}</p>
                <p className="flex items-center gap-1 text-xs text-ash">
                  {p.trained_today ? (
                    <>
                      <Flame className="size-3.5 text-gold" aria-hidden="true" /> Trained today
                    </>
                  ) : p.last_visit ? (
                    `Last visit: ${ago(p.last_visit)}`
                  ) : (
                    'Visits not shared'
                  )}
                </p>
              </div>
              <button type="button" onClick={() => unfriend(p)} aria-label={`Remove ${p.name}`} className="press -mr-2 grid size-11 place-items-center rounded-full text-ash active:text-[#FF9AA8]">
                <UserMinus className="size-4" aria-hidden="true" />
              </button>
            </motion.li>
          ))}
          {outgoing.map((p) => (
            <li key={p.member_id} className="flex items-center gap-3 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paper/6 text-ash" aria-hidden="true">
                <UserPlus className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="tabular truncate font-semibold tracking-[0.06em]">{p.name}</p>
                <p className="text-xs text-ash">Request sent</p>
              </div>
              <button type="button" onClick={() => act('friend_remove', { p_member_id: p.member_id }, 'Request cancelled')} className="press h-11 rounded-lg px-3 text-sm font-semibold text-ash ring-1 ring-paper/12">
                Cancel
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Leaderboard hasFriends={friends.length > 0} sharing={m.share_lifts} />

      <div className="mt-4 space-y-3">
        <Toggle Icon={Eye} label="Share my visits" on={m.share_visits} save={saveSharing((on) => ({ p_visits: on }))}>
          Friends see when you trained today and your last visit.
        </Toggle>
        <Toggle Icon={Medal} label="Share my lifts" on={m.share_lifts} save={saveSharing((on) => ({ p_lifts: on }))}>
          Your best sets show on your friends' leaderboards.
        </Toggle>
      </div>
    </motion.div>
  )
}

function Leaderboard({ hasFriends, sharing }) {
  const [exercises] = useExercises()
  const [ex, setEx] = useState(null)
  const [rows, setRows] = useState(null)
  const pick = ex ?? exercises?.[0]?.id
  useEffect(() => {
    if (!pick) return
    setRows(null)
    supabase.rpc('friends_leaderboard', { p_exercise_id: pick }).then(({ data, error }) => setRows(error ? [] : data))
  }, [pick])

  return (
    <Panel title="Leaderboard">
      {exercises && (
        <div className="mt-4">
          <Picker label="Lift" value={pick} onChange={setEx} options={exercises.map((x) => ({ value: x.id, label: x.name }))} />
        </div>
      )}
      {!rows && <Loading label="Loading leaderboard" />}
      {rows?.length === 0 && <p className="mt-3 text-ash">Nobody has logged this lift yet. Be the first on the Lifts tab.</p>}
      <ol className="mt-2 divide-y divide-paper/8">
        {rows?.map((r, k) => (
          <motion.li key={`${pick}-${k}`} {...enter(k)} className={`-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 ${r.is_me ? 'bg-gold/10' : ''}`}>
            <span className={`tabular w-6 text-center font-display text-xl font-black ${k === 0 ? 'text-gold' : 'text-ash'}`}>{k + 1}</span>
            <span className="min-w-0 flex-1 truncate font-semibold">{r.is_me ? 'You' : r.name}</span>
            <span className="tabular font-semibold">{set(r)}</span>
          </motion.li>
        ))}
      </ol>
      {rows && (
        <p className="mt-3 text-xs text-ash">
          {!hasFriends
            ? 'Add friends to compare lifts.'
            : !sharing
              ? "Friends can't see you here until you turn on Share my lifts."
              : 'Only friends who turned on Share my lifts are listed.'}
        </p>
      )}
    </Panel>
  )
}
