import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy, Dumbbell, Eye, Flame, Medal, Share2, Trash2, Trophy, UserMinus, UserPlus, X } from 'lucide-react'
import { message, supabase } from '../lib/supabase.js'
import { useAuth } from '../auth.jsx'
import { EASE_OUT, dayNo, long, manilaToday } from '../components/ui.jsx'
import { CodeField, Field, Notice, Submit, Toggle, gymCode } from '../components/form.jsx'

const ago = (iso) => {
  const d = dayNo(manilaToday()) - dayNo(iso)
  return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : d < 14 ? `${d} days ago` : long(iso)
}
const set = (r) => `${+r.weight_kg} kg × ${r.reps}`

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
const Select = ({ label, children, ...props }) => (
  <label className="block">
    <span className="block text-sm font-semibold">{label}</span>
    <select {...props} className="mt-1.5 h-12 w-full rounded-lg bg-ink-2 px-3 text-base text-paper ring-1 ring-paper/12 focus:ring-2 focus:ring-gold focus:outline-none">
      {children}
    </select>
  </label>
)
const enter = (k) => ({
  initial: { opacity: 0, transform: 'translateY(6px)' },
  animate: { opacity: 1, transform: 'translateY(0px)' },
  transition: { duration: 0.22, delay: Math.min(k, 8) * 0.03, ease: EASE_OUT },
})

// ---------------------------------------------------------------------------
// Lifts: log a set, see PRs per exercise, browse history.
// ---------------------------------------------------------------------------
export function Lifts() {
  const [exercises, exError] = useExercises()
  const [prs, setPrs] = useState(null)
  const [history, setHistory] = useState(null)
  const [filter, setFilter] = useState(null) // exercise id, or null for all
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(null) // { pr, text }

  const load = useCallback(() => {
    supabase.rpc('my_prs').then(({ data, error }) => setPrs(error ? [] : data))
    supabase.rpc('my_lifts', { p_exercise_id: filter }).then(({ data, error }) => setHistory(error ? [] : data))
  }, [filter])
  useEffect(load, [load])

  const log = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const exercise = exercises.find((x) => x.id === f.get('exercise'))
    setBusy(true)
    setError(null)
    setDone(null)
    const { data, error } = await supabase.rpc('lift_add', {
      p_exercise_id: exercise?.id,
      p_weight_kg: Number(f.get('weight')),
      p_reps: Number(f.get('reps')),
      p_lifted_on: f.get('day') || null,
    })
    setBusy(false)
    if (error) return setError(message(error))
    setDone({ pr: data.pr, text: `${exercise.name}: ${+f.get('weight')} kg × ${f.get('reps')}` })
    load()
  }

  const remove = async (r) => {
    if (!confirm(`Delete ${r.exercise} ${set(r)} from ${long(r.lifted_on)}?`)) return
    setHistory((h) => h.filter((x) => x.id !== r.id)) // optimistic
    const { error } = await supabase.rpc('lift_delete', { p_id: r.id })
    if (error) alert(message(error))
    load()
  }

  const today = manilaToday()
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE_OUT }}>
      <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none">Lifts</h1>
      <p className="mt-2 text-ash">Log your sets. Beat your best and it counts as a PR.</p>

      <Panel title="Log a set">
        {exError && <p className="mt-3 text-ash">{exError}</p>}
        {!exercises && !exError && <Loading label="Loading exercises" />}
        {exercises && (
          <form onSubmit={log} className="mt-4 space-y-4">
            <Select label="Exercise" name="exercise" defaultValue={exercises[0]?.id}>
              {exercises.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Weight (kg)" name="weight" type="number" inputMode="decimal" min="0" max="1000" step="0.25" placeholder="60" required />
              <Field label="Reps" name="reps" type="number" inputMode="numeric" min="1" max="100" step="1" placeholder="5" required />
            </div>
            <Field label="Date" name="day" type="date" defaultValue={today} max={today} />
            <Notice>{error}</Notice>
            <AnimatePresence mode="wait">
              {done && (
                <motion.div
                  key={done.text}
                  role="status"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ type: 'spring', duration: 0.4, bounce: done.pr ? 0.45 : 0 }}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 ${done.pr ? 'bg-gold text-ink' : 'bg-active/15 text-[#7EE2A8]'}`}
                >
                  {done.pr ? <Trophy className="size-6 shrink-0" aria-hidden="true" /> : <Check className="size-5 shrink-0" aria-hidden="true" />}
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
                className={`press h-full w-full rounded-xl p-3 text-left ring-1 ${filter === p.exercise_id ? 'bg-gold/12 ring-gold' : 'bg-paper/4 ring-paper/8'}`}
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
            <button type="button" onClick={() => setFilter(null)} className="flex items-center gap-1 text-sm font-semibold text-gold">
              <X className="size-4" aria-hidden="true" /> Show all
            </button>
          )
        }
      >
        {!history && <Loading label="Loading history" />}
        {history?.length === 0 && <p className="mt-3 text-ash">Nothing logged yet.</p>}
        <ol className="mt-2 divide-y divide-paper/8">
          {history?.map((r, k) => (
            <motion.li key={r.id} {...enter(k)} className="flex items-center gap-3 py-2.5">
              <Dumbbell className="size-4 shrink-0 text-gold" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.exercise}</p>
                <p className="tabular text-xs text-ash">{ago(r.lifted_on)}</p>
              </div>
              <span className="tabular font-semibold">{set(r)}</span>
              <button type="button" onClick={() => remove(r)} aria-label={`Delete ${r.exercise} ${set(r)}`} className="grid size-10 place-items-center rounded-full text-ash hover:text-[#FF9AA8]">
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </motion.li>
          ))}
        </ol>
      </Panel>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Friends: add by member code, requests, who trained today, leaderboard.
// ---------------------------------------------------------------------------
export function Friends({ m }) {
  const { refresh } = useAuth()
  const [people, setPeople] = useState(null)
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
    const form = e.currentTarget
    setBusy(true)
    setError(null)
    setSent(null)
    const { data, error } = await supabase.rpc('friend_request', { p_code: gymCode(new FormData(form).get('code')) })
    setBusy(false)
    if (error) return setError(message(error))
    form.reset()
    setSent(
      data.result === 'sent'
        ? `Request sent to ${data.name}. They'll see it on their Friends tab.`
        : data.result === 'accepted'
          ? `You and ${data.name} are now friends.`
          : `You're already connected with ${data.name}.`,
    )
    load()
  }

  const act = async (fn, args) => {
    const { error } = await supabase.rpc(fn, args)
    if (error) alert(message(error))
    load()
  }

  const share = async () => {
    const text = `Add me as a friend on the CourageD app. My code: ${m.code}`
    try {
      if (navigator.share) return await navigator.share({ text })
      await navigator.clipboard.writeText(m.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* share sheet dismissed */
    }
  }

  const saveSharing = (patch) => async (on) => {
    const { error } = await supabase.rpc('member_set_sharing', { p_visits: null, p_lifts: null, ...patch(on) })
    if (!error) refresh()
    return !error
  }

  const incoming = people?.filter((p) => p.state === 'incoming') ?? []
  const friends = people?.filter((p) => p.state === 'friend') ?? []
  const outgoing = people?.filter((p) => p.state === 'outgoing') ?? []
  const trainedToday = friends.filter((p) => p.trained_today).length

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE_OUT }}>
      <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none">Friends</h1>
      <p className="mt-2 text-ash">Friends only see your first name and last initial, plus what you choose to share below.</p>

      <section className="mt-4 flex items-center gap-3 rounded-2xl bg-paper p-4 text-ink">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-smoke">Your friend code</p>
          <p className="tabular font-display text-2xl font-black">{m.code}</p>
        </div>
        <button type="button" onClick={share} className="press flex h-11 items-center gap-2 rounded-lg bg-ink px-4 font-semibold text-paper">
          {copied ? <Check className="size-4" aria-hidden="true" /> : navigator.share ? <Share2 className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          {copied ? 'Copied' : navigator.share ? 'Share' : 'Copy'}
        </button>
      </section>

      <Panel title="Add a friend">
        <form onSubmit={add} className="mt-4 space-y-4">
          <CodeField label="Friend's code" hint="It's under their name on their pass and on their Friends tab." />
          <Notice>{error}</Notice>
          <Notice tone="ok">{sent}</Notice>
          <Submit busy={busy}>
            <UserPlus className="size-5" aria-hidden="true" /> Send request
          </Submit>
        </form>
      </Panel>

      {incoming.length > 0 && (
        <Panel title="Requests" aside={<span className="tabular rounded-full bg-gold px-2.5 py-0.5 text-sm font-bold text-ink">{incoming.length}</span>}>
          <ul className="mt-2 divide-y divide-paper/8">
            {incoming.map((p, k) => (
              <motion.li key={p.member_id} {...enter(k)} className="flex items-center gap-2 py-3">
                <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
                <button type="button" onClick={() => act('friend_respond', { p_member_id: p.member_id, p_accept: false })} className="press h-10 rounded-lg px-3 text-sm font-semibold text-ash ring-1 ring-paper/12">
                  Decline
                </button>
                <button type="button" onClick={() => act('friend_respond', { p_member_id: p.member_id, p_accept: true })} className="press h-10 rounded-lg bg-gold px-4 text-sm font-bold text-ink">
                  Accept
                </button>
              </motion.li>
            ))}
          </ul>
        </Panel>
      )}

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
              <span className={`grid size-9 shrink-0 place-items-center rounded-full font-display text-lg font-black ${p.trained_today ? 'bg-gold text-ink' : 'bg-paper/8 text-paper'}`} aria-hidden="true">
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
              <button
                type="button"
                onClick={() => confirm(`Remove ${p.name} from your friends?`) && act('friend_remove', { p_member_id: p.member_id })}
                aria-label={`Remove ${p.name}`}
                className="grid size-10 place-items-center rounded-full text-ash hover:text-[#FF9AA8]"
              >
                <UserMinus className="size-4" aria-hidden="true" />
              </button>
            </motion.li>
          ))}
          {outgoing.map((p) => (
            <li key={p.member_id} className="flex items-center gap-3 py-3 opacity-70">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper/8 font-display text-lg font-black" aria-hidden="true">
                {p.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.name}</p>
                <p className="text-xs text-ash">Request sent</p>
              </div>
              <button type="button" onClick={() => act('friend_remove', { p_member_id: p.member_id })} className="press h-10 rounded-lg px-3 text-sm font-semibold text-ash ring-1 ring-paper/12">
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
          <Select label="Lift" value={pick ?? ''} onChange={(e) => setEx(e.target.value)}>
            {exercises.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </Select>
        </div>
      )}
      {!rows && <Loading label="Loading leaderboard" />}
      {rows?.length === 0 && <p className="mt-3 text-ash">Nobody has logged this lift yet. Be the first on the Lifts tab.</p>}
      <ol className="mt-2 divide-y divide-paper/8">
        {rows?.map((r, k) => (
          <motion.li key={k} {...enter(k)} className={`-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 ${r.is_me ? 'bg-gold/10' : ''}`}>
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
