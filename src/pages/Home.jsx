import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate as tween,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { animate, createScope, stagger } from 'animejs'
import { AirVent, ArrowLeft, ArrowRight, ArrowUpRight, Car, Clock, Droplets, MapPin, Mail, MessageCircle, Pause, Phone, Play, ShowerHead, Wifi } from 'lucide-react'
import { Link } from 'react-router'
import { AMENITIES, COACHES, FAQ, GYM, openStatus, peso } from '../data/gym.js'
import { supabase } from '../lib/supabase.js'
import SlideTextButton from '../components/kokonutui/slide-text-button.jsx'
import { CountUp, EASE_IN_OUT, EASE_OUT } from '../components/ui.jsx'


// Section heading whose lines rise out of a mask when scrolled into view.
function Heading({ lines, className = '' }) {
  return (
    <motion.h2
      className={`font-display text-5xl font-black uppercase leading-[0.9] md:text-6xl ${className}`}
      initial="out"
      whileInView="in"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ staggerChildren: 0.08 }}
    >
      {lines.map((l, k) => (
        <span key={k} className="block overflow-hidden pb-1">
          <motion.span className="block" variants={{ out: { y: '110%' }, in: { y: '0%' } }} transition={{ duration: 0.75, ease: EASE_OUT }}>
            {l}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  )
}

// Story-style progress bar. Its CSS animation is the timer: when it ends, onDone advances the slide.
function Progress({ state, run, dur, paused, onDone }) {
  return (
    <span className="mt-2 block h-0.5 overflow-hidden rounded-full bg-paper/20">
      <span
        key={run}
        onAnimationEnd={state === 'active' ? onDone : undefined}
        className={`block h-full origin-left bg-gold ${state === 'active' ? 'fill' : state === 'done' ? '' : 'scale-x-0'}`}
        style={{ '--dur': `${dur}s`, animationPlayState: paused ? 'paused' : 'running' }}
      />
    </span>
  )
}

export default function Home() {
  return (
    <div className="bg-mist pb-16">
      <Header />
      <Hero />
      <Marquee />
      <Floor />
      <Coaches />
      <Membership />
      <Amenities />
      <Faq />
      <Visit />
      <Footer />
    </div>
  )
}

function Header() {
  const links = [
    ['Coaches', '#coaches'],
    ['Membership', '#membership'],
    ['Amenities', '#amenities'],
    ['Visit', '#visit'],
  ]
  return (
    <header className="sticky top-0 z-30 bg-ink text-paper">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/assets/logo.jpg" alt="" className="size-10 mix-blend-lighten" />
          <span className="font-display text-xl font-extrabold uppercase leading-none tracking-[0.04em]">
            CourageD <span className="text-gold">Fitness Hub</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Sections">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="text-sm font-semibold uppercase tracking-[0.12em] text-ash transition-colors duration-150 hover:text-gold">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link to="/login" className="hidden rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-ash transition-colors duration-150 hover:text-gold sm:block">
            Sign in
          </Link>
          <Link to="/pass" className="press rounded-md bg-crimson px-4 py-2 font-display text-base font-bold uppercase tracking-[0.06em]">
            My pass
          </Link>
        </div>
      </div>
    </header>
  )
}

const HERO_SLIDES = [
  { src: '/assets/gym-dumbbells.jpg', label: 'Free weights', alt: 'Dumbbell racks and benches on green turf', pos: '70% 50%' },
  { src: '/assets/gym-cardio.jpg', label: 'Cardio deck', alt: 'Spin bikes and curved treadmills by the window', pos: '60% 50%' },
  { src: '/assets/gym-training.jpg', label: 'Strength floor', alt: 'A member doing barbell curls between plate racks', pos: '58% 30%' },
  { src: '/assets/gym-smith.jpg', label: 'Smith & racks', alt: 'Close-up of the Smith machine bar', pos: '50% 50%' },
]
const HERO_DWELL = 6 // seconds per photo: slow pan, then a quick wipe

function Hero() {
  const root = useRef(null)
  const [slide, setSlide] = useState({ i: 0, n: 0 }) // n only grows: React key + stacking order
  const go = (i) => setSlide((s) => (i === s.i ? s : { i, n: s.n + 1 }))
  const status = openStatus()

  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const fgY = useTransform(scrollYProgress, [0, 1], [0, -140])
  const fgOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  useLayoutEffect(() => {
    const scope = createScope({ root, mediaQueries: { reduce: '(prefers-reduced-motion: reduce)' } }).add((self) => {
      if (self.matches.reduce) return
      animate('.line > span', { y: ['105%', '0%'], duration: 800, delay: stagger(90, { start: 150 }), ease: 'out(4)' })
      animate('.rise', { opacity: [0, 1], y: [14, 0], duration: 600, delay: stagger(70, { start: 520 }), ease: 'out(4)' })
    })
    return () => scope.revert()
  }, [])

  const s = HERO_SLIDES[slide.i]
  return (
    <section id="top" ref={root} className="relative isolate overflow-hidden bg-ink text-paper">
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10">
        <AnimatePresence>
          <motion.div
            key={slide.n}
            style={{ zIndex: slide.n }}
            className="absolute inset-0 overflow-hidden"
            initial={{ clipPath: 'inset(0 0 0 100%)' }}
            animate={{ clipPath: 'inset(0 0 0 0%)' }}
            exit={{ clipPath: 'inset(0 0 0 0%)', transition: { duration: 0.8 } }} // hold until covered
            transition={{ duration: 0.8, ease: EASE_IN_OUT }}
          >
            <motion.img
              src={s.src}
              alt={s.alt}
              style={{ objectPosition: s.pos }}
              className="h-full w-full object-cover"
              initial={{ scale: 1.18, x: '1.5%' }}
              animate={{ scale: 1.05, x: '-1.5%' }}
              transition={{ duration: HERO_DWELL + 1.2, ease: 'linear' }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <div className="absolute inset-0 -z-5 bg-linear-to-r from-ink via-ink/80 to-ink/10 max-md:bg-linear-to-t max-md:via-ink/75" />

      <motion.div
        style={{ y: fgY, opacity: fgOpacity }}
        className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-end px-4 pt-28 pb-24 sm:px-8 md:justify-center"
      >
        <p className="rise mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-paper/15 bg-ink/60 px-3 py-1.5 text-sm font-semibold">
          <span className={`size-2 rounded-full ${status.open ? 'bg-active' : 'bg-ash'}`} aria-hidden="true" />
          {status.label}
        </p>
        <h1 className="font-display text-[clamp(3.6rem,10vw,6rem)] font-black uppercase leading-[0.86] tracking-[-0.01em] text-balance">
          <span className="rise mb-4 block font-sans text-sm font-bold leading-normal tracking-[0.14em] text-gold">Gym &amp; fitness coaching · Talamban, Cebu City</span>
          <span className="line block overflow-hidden pb-1"><span className="block">Courage,</span></span>
          <span className="line block overflow-hidden pb-1"><span className="block text-gold">one rep</span></span>
          <span className="line block overflow-hidden pb-1"><span className="block">at a time.</span></span>
        </h1>
        <p className="rise mt-6 max-w-md text-lg text-paper/80">
          CourageD Fitness Hub is an air-conditioned gym on Miñoza St., Talamban, Cebu City. Free weights, machines, cardio and fitness coaching, with a locker and shower waiting after.
        </p>
        <div className="rise mt-8 flex flex-wrap gap-3">
          <SlideTextButton href="#membership" text="See membership" hoverText="Pick your plate" />
          <SlideTextButton href={GYM.facebook} target="_blank" rel="noreferrer" variant="ghost" text="Message us" hoverText="On Facebook" />
        </div>
        <div className="rise mt-12 flex max-w-xl gap-3" aria-label="Gym photos">
          {HERO_SLIDES.map((h, k) => (
            <button key={h.label} type="button" onClick={() => go(k)} aria-label={`Show ${h.label}`} aria-current={k === slide.i} className="group flex-1 py-1 text-left">
              <span className={`hidden text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-200 sm:block ${k === slide.i ? 'text-paper' : 'text-ash group-hover:text-paper'}`}>
                {h.label}
              </span>
              <Progress
                state={k === slide.i ? 'active' : k < slide.i ? 'done' : 'todo'}
                run={slide.n}
                dur={HERO_DWELL}
                onDone={() => go((slide.i + 1) % HERO_SLIDES.length)}
              />
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

const wrap = (min, max, v) => ((((v - min) % (max - min)) + (max - min)) % (max - min)) + min
const MARQUEE = ['Strength', 'Cardio', 'Coaching', 'Air-conditioned', 'Talamban, Cebu', 'Open 7 days']

// Drifts on its own; scrolling speeds it up and flips its direction.
function Marquee() {
  const reduce = useReducedMotion()
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const boost = useTransform(velocity, [-1000, 0, 1000], [-5, 0, 5], { clamp: false })
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`)
  const dir = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    const b = boost.get()
    if (b < -0.05) dir.current = -1
    else if (b > 0.05) dir.current = 1
    base.set(base.get() - dir.current * 2.2 * (delta / 1000) * (1 + Math.abs(b)))
  })

  const row = MARQUEE.flatMap((w) => [w, '·'])
  return (
    <div className="overflow-hidden border-y border-paper/10 bg-ink py-4 text-paper" aria-hidden="true">
      <motion.div className="flex w-max whitespace-nowrap" style={{ x }}>
        {[0, 1].map((copy) => (
          <span key={copy} className="flex">
            {row.concat(row).map((w, k) => (
              <span key={k} className={`px-4 font-display text-3xl font-extrabold uppercase ${w === '·' ? 'text-crimson' : k % 4 === 2 ? 'text-gold' : ''}`}>
                {w}
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

function Floor() {
  const shots = [
    ['/assets/gym-cardio.jpg', 'Cardio deck', 'Spin bikes and curved treadmills by the window', 'md:row-span-2'],
    ['/assets/gym-training.jpg', 'Free weights', 'EZ bars, plates and racks', ''],
    ['/assets/gym-smith.jpg', 'Smith & racks', 'Guided bar work for heavy days', ''],
  ]
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 md:py-28">
      <div className="grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-14">
        <div className="md:pt-6">
          <Heading lines={['Built for', 'the work.']} />
          <p className="mt-5 max-w-prose text-lg text-smoke">
            {GYM.about.text}
          </p>
          <dl className="mt-8 flex gap-10">
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-smoke">Since</dt>
              <dd className="tabular font-display text-4xl font-extrabold">{GYM.about.founded}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-smoke">Members</dt>
              <dd className="tabular font-display text-4xl font-extrabold">{GYM.about.members}</dd>
            </div>
          </dl>
        </div>
        <div className="grid gap-3 md:grid-cols-2 md:grid-rows-2">
          {shots.map(([src, title, caption, span], k) => (
            <motion.figure
              key={title}
              className={`group relative min-h-56 overflow-hidden rounded-lg bg-ink ${span}`}
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: k * 0.12, ease: EASE_IN_OUT }}
            >
              <motion.img
                src={src}
                alt={caption}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-(--ease-out) group-hover:scale-[1.04]"
                initial={{ y: '-8%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 1.2, delay: k * 0.12, ease: EASE_OUT }}
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/90 to-transparent p-4 pt-12 text-paper">
                <span className="block font-display text-2xl font-extrabold uppercase leading-none">{title}</span>
                <span className="text-sm text-paper/75">{caption}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}

// Coach carousel: the centred coach drifts slowly left; once it has drifted DRIFT of a slot
// it whips to the next coach on a spring. One motion value `pos` (in slots) drives everything.
const DRIFT = 0.16 // how far the centred coach drifts before the whip, in slot widths
const DWELL = 5.5 // seconds to drift that far
const WHIP = { type: 'spring', stiffness: 380, damping: 30, mass: 0.9 }
const LOOP = [...COACHES, ...COACHES] // doubled so the wrap jump always happens off-screen
const wrapSlot = (v) => {
  const L = LOOP.length
  return ((((v + L / 2) % L) + L) % L) - L / 2
}
const mod = (n) => ((n % COACHES.length) + COACHES.length) % COACHES.length
const reveal = {
  out: { opacity: 0, y: 28, filter: 'blur(6px)' },
  in: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE_OUT } },
  gone: { opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: 0.15, ease: 'easeIn' } },
}

function Coaches() {
  const stage = useRef(null)
  const slot = useRef(null)
  const inView = useInView(stage, { amount: 0.4 })
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [hover, setHover] = useState(false)
  const [stopped, setStopped] = useState(false)

  const pos = useMotionValue(0)
  const base = useRef(0) // slot the current drift started from
  const whip = useRef(null)
  const drag = useRef(null)
  const paused = stopped || hover || !inView || reduce
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  // Whip blur and lean come from how fast `pos` is moving, so they appear only mid-whip.
  const vel = useVelocity(pos)
  const skew = useTransform(vel, (v) => Math.max(-7, Math.min(7, v * 1.4)))
  const blur = useTransform(vel, (v) => `blur(${Math.min(6, Math.abs(v) * 0.9)}px)`)
  const fillBar = useTransform(pos, (v) => Math.max(0, Math.min(1, (v - Math.round(v)) / DRIFT)))

  useMotionValueEvent(pos, 'change', (v) => setI(mod(Math.round(v))))

  const go = (n) => {
    whip.current?.stop()
    base.current = n
    const c = tween(pos, n, reduce ? { duration: 0 } : WHIP)
    whip.current = c
    c.then(() => whip.current === c && (whip.current = null))
  }

  useAnimationFrame((_, dt) => {
    if (pausedRef.current || whip.current || drag.current) return
    const v = pos.get() + ((dt / 1000) * DRIFT) / DWELL
    if (v - base.current >= DRIFT) go(base.current + 1)
    else pos.set(v)
  })

  const step = (d) => go(Math.round(pos.get()) + d)
  const next = COACHES[mod(i + 1)]
  const coach = COACHES[i]
  const first = coach.name.split(' ')[1]

  return (
    <section id="coaches" className="overflow-hidden bg-ink py-20 text-paper md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Heading lines={['Your corner,', <span className="text-gold">three coaches deep.</span>]} />
          <p className="max-w-sm text-ash">Personal fitness coaching for every level, from your first session to your heaviest lift. Swipe or use the arrows.</p>
        </div>

        <motion.div
          ref={stage}
          role="region"
          aria-roledescription="carousel"
          aria-label="Coaches"
          className="relative mt-12 h-[41rem] touch-pan-y overflow-hidden rounded-xl bg-ink-2 select-none md:h-[min(80vh,46rem)]"
          onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(false)}
          onPanStart={() => {
            whip.current?.stop()
            whip.current = null
            drag.current = pos.get()
          }}
          onPan={(_, { offset }) => pos.set(drag.current - offset.x / slot.current.offsetWidth)}
          onPanEnd={(_, { velocity }) => {
            drag.current = null
            go(Math.round(pos.get() - (velocity.x / slot.current.offsetWidth) * 0.25))
          }}
        >
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_85%,rgb(254_190_16/0.22),transparent_70%)]" />
          {LOOP.map((c, k) => (
            <CoachSlot key={k} k={k} coach={c} pos={pos} skew={skew} blur={blur} ref={k === 0 ? slot : undefined} />
          ))}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink via-ink/20 to-transparent md:bg-linear-to-r md:from-ink/95 md:via-ink/10" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 max-w-xl p-6 md:p-12" aria-live={paused ? 'polite' : 'off'}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={i} initial="out" animate="in" exit="gone" variants={{ in: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}>
                <motion.p variants={reveal} className="text-sm font-bold uppercase tracking-[0.16em] text-gold">
                  {coach.role}
                </motion.p>
                <motion.h3 variants={reveal} className="font-display text-5xl font-black uppercase leading-[0.85] sm:text-6xl md:text-8xl">
                  {coach.name}
                </motion.h3>
                <motion.ul variants={reveal} className="mt-5 flex flex-wrap gap-2">
                  {coach.focus.map((f) => (
                    <li key={f} className="rounded-full bg-ink/60 px-3 py-1 text-sm font-semibold ring-1 ring-paper/15 backdrop-blur-sm">
                      {f}
                    </li>
                  ))}
                </motion.ul>
                <motion.div variants={reveal} className="pointer-events-auto mt-7">
                  <SlideTextButton href={GYM.facebook} target="_blank" rel="noreferrer" variant="gold" text={`Train with ${first}`} hoverText="Message us on Facebook" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => step(1)}
            className="press absolute top-5 right-5 hidden items-center gap-3 rounded-lg bg-ink/70 p-2 pr-4 text-left ring-1 ring-paper/10 backdrop-blur-sm md:flex"
          >
            <img src={next.photo} alt="" width="48" height="48" className="size-12 rounded-md bg-ink-2 object-cover object-top" />
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.12em] text-ash">Up next</span>
              <span className="font-display text-xl font-extrabold uppercase leading-none">{next.name}</span>
            </span>
          </button>
        </motion.div>

        <div className="mt-5 flex items-center gap-6">
          <div className="flex flex-1 gap-3">
            {COACHES.map((c, k) => (
              <button
                key={c.name}
                type="button"
                onClick={() => go(Math.round(pos.get()) + ((k - i + COACHES.length) % COACHES.length))}
                aria-label={`Show ${c.name}`}
                aria-current={k === i}
                className="group flex-1 py-1 text-left"
              >
                <span className={`text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-200 ${k === i ? 'text-paper' : 'text-ash group-hover:text-paper'}`}>
                  <span className="hidden sm:inline">Coach </span>
                  {c.name.split(' ')[1]}
                </span>
                <span className="mt-2 block h-0.5 overflow-hidden rounded-full bg-paper/20">
                  <motion.span className="block h-full origin-left bg-gold" style={{ scaleX: k === i ? fillBar : k < i ? 1 : 0 }} />
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {!reduce && (
              <button
                type="button"
                onClick={() => setStopped((s) => !s)}
                aria-label={stopped ? 'Play coach carousel' : 'Pause coach carousel'}
                className="press grid size-11 place-items-center rounded-full ring-1 ring-paper/20 transition-colors hover:bg-paper/10"
              >
                {stopped ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              </button>
            )}
            <button type="button" onClick={() => step(-1)} aria-label="Previous coach" className="press grid size-11 place-items-center rounded-full ring-1 ring-paper/20 transition-colors hover:bg-paper/10">
              <ArrowLeft className="size-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next coach" className="press grid size-11 place-items-center rounded-full bg-gold text-ink">
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// One coach cut-out. Its place, size and fade all follow `pos`; the centred one is 1, neighbours shrink and dim.
function CoachSlot({ k, coach, pos, skew, blur, ref }) {
  const off = useTransform(pos, (v) => wrapSlot(k - v))
  const x = useTransform(off, (o) => `${o * 100 - 50}%`)
  const near = useTransform(off, (o) => Math.min(1, Math.abs(o)))
  const scale = useTransform(near, [0, 1], [1, 0.74])
  const opacity = useTransform(near, [0, 1], [1, 0.35])
  return (
    <motion.div ref={ref} aria-hidden="true" className="absolute top-4 left-1/2 h-[52%] w-[80%] origin-bottom [mask-image:linear-gradient(black_80%,transparent)] md:top-auto md:bottom-0 md:h-[88%] md:w-[38%] md:[mask-image:none]" style={{ x, scale, opacity }}>
      <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-display text-[14rem] font-black leading-none text-transparent [-webkit-text-stroke:2px_rgb(254_190_16/0.28)] md:text-[26rem]">
        {coach.name.split(' ')[1][0]}
      </span>
      <motion.img
        src={coach.photo}
        alt=""
        width="880"
        height="1100"
        loading="lazy"
        decoding="async"
        draggable={false}
        className="relative h-full w-full object-contain object-bottom"
        style={{ skewX: skew, filter: blur }}
      />
    </motion.div>
  )
}

// Bumper-plate colours follow the competition convention: white light, black, yellow, red heaviest.
// Codes match Members › Plans in the POS; a plate whose plan is missing or inactive is left out.
const PLATES = [
  { code: 'DAY', size: '18%', cls: 'bg-paper text-ink ring-ink/15' },
  { code: 'MONTH', size: '22%', cls: 'bg-ink-2 text-paper ring-paper/15' },
  { code: 'M3', size: '26%', cls: 'bg-gold text-ink ring-ink/15' },
  { code: 'Y1', size: '30%', cls: 'bg-crimson text-paper ring-paper/20' },
]

// Live price list from the POS. undefined = loading, null = couldn't load.
function usePrices() {
  const [list, setList] = useState(supabase ? undefined : null)
  useEffect(() => {
    if (!supabase) return
    let live = true
    supabase.rpc('public_price_list').then(({ data, error }) => live && setList(error ? null : data))
    return () => {
      live = false
    }
  }, [])
  return list
}

function Membership() {
  const list = usePrices()
  const plates = (list ?? [])
    .filter((p) => PLATES.some((x) => x.code === p.code))
    .map((p) => ({ ...PLATES.find((x) => x.code === p.code), ...p, days: p.duration_days ?? 1 }))
    .sort((a, b) => a.days - b.days)
  const [pick, setPick] = useState('M3')
  const plan = plates.find((p) => p.code === pick) ?? plates[0]
  const best = plates.reduce((a, b) => (!a || b.price / b.days < a.price / a.days ? b : a), null)?.code
  const swap = {
    initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.14 } },
    transition: { duration: 0.26, ease: EASE_OUT },
  }

  return (
    <section id="membership" className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Heading lines={['Pick your plate.']} />
          <p className="max-w-sm text-smoke">The heavier the commitment, the lighter the price per day.</p>
        </div>

        {list === null ? (
          <p className="mt-12 rounded-xl bg-mist p-6 text-smoke">
            Prices didn't load. Call us at{' '}
            <a className="font-semibold text-ink underline" href={GYM.phoneHref}>
              {GYM.phone}
            </a>{' '}
            or check again in a moment.
          </p>
        ) : (
          <div className="mt-12 grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <div role="radiogroup" aria-label="Membership plans" aria-busy={list === undefined} className="relative">
              {/* The row owns the in-view trigger: plates start off-screen, so they can't observe themselves.
                  Keyed on the count so plates that arrive after the row scrolled into view still roll in. */}
              <motion.div
                key={plates.length}
                className="flex min-h-24 items-end justify-between gap-[1.5%]"
                initial="out"
                whileInView="in"
                viewport={{ once: true, margin: '-80px' }}
                transition={{ staggerChildren: 0.08 }}
              >
                {plates.map((p) => {
                  const on = p.code === plan?.code
                  return (
                    <motion.div
                      key={p.code}
                      style={{ width: p.size }}
                      className="shrink-0"
                      variants={{ out: { x: -90, rotate: -160, opacity: 0 }, in: { x: 0, rotate: 0, opacity: 1 } }}
                      transition={{ duration: 0.8, ease: EASE_OUT }}
                    >
                      <motion.button
                        type="button"
                        role="radio"
                        aria-checked={on}
                        aria-label={`${p.name}, ${peso(p.price)}`}
                        onClick={() => setPick(p.code)}
                        className={`relative aspect-square w-full rounded-full shadow-[0_10px_24px_-8px_rgb(25_23_27/0.45)] ring-[3px] ring-inset ${p.cls} ${on ? 'outline-[3px] outline-offset-4 outline-gold' : ''}`}
                        animate={{ y: on ? -18 : 0, rotate: on ? 0 : -6 }}
                        whileHover={{ rotate: on ? 0 : 8 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ y: { type: 'spring', duration: 0.4, bounce: 0.25 }, rotate: { type: 'spring', duration: 0.5, bounce: 0.3 }, scale: { duration: 0.12 } }}
                      >
                        <span aria-hidden="true" className="absolute inset-[9%] rounded-full border border-current opacity-25" />
                        <span aria-hidden="true" className="absolute top-1/2 left-1/2 size-[18%] -translate-1/2 rounded-full bg-mist ring-2 ring-ink/30" />
                        <span className="absolute inset-x-0 top-[16%] text-center font-display text-[clamp(0.9rem,3.2vw,2.4rem)] leading-none font-black">{p.days}</span>
                        <span className="absolute inset-x-0 bottom-[17%] text-center text-[clamp(0.5rem,1.2vw,0.75rem)] font-bold uppercase tracking-[0.16em] opacity-80">{p.days === 1 ? 'day' : 'days'}</span>
                      </motion.button>
                    </motion.div>
                  )
                })}
              </motion.div>
              <div aria-hidden="true" className="h-2 rounded-full bg-ink" />
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-smoke">Tap a plate</p>
            </div>

            <div className="rounded-xl bg-ink p-7 text-paper">
              {!plan ? (
                <div className="animate-pulse space-y-4" aria-label="Loading prices">
                  <div className="h-8 w-1/2 rounded bg-paper/10" />
                  <div className="h-16 w-2/3 rounded bg-paper/10" />
                  <div className="h-24 rounded bg-paper/10" />
                </div>
              ) : (
                <>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div key={plan.code} {...swap} className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-3xl font-extrabold uppercase">{plan.name}</h3>
                      {plan.code === best && plates.length > 1 && <span className="rounded-sm bg-gold px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] text-ink">Best per day</span>}
                    </motion.div>
                  </AnimatePresence>
                  <p className="tabular mt-2 font-display text-7xl font-black leading-none text-gold">
                    <CountUp value={plan.price} format={peso} />
                  </p>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div key={plan.code} {...swap}>
                      <p className="tabular mt-3 text-ash">
                        {plan.days === 1 ? 'Single walk-in visit' : `${plan.days} days of access · about ${peso(plan.price / plan.days)} a day`}
                        {plan.student_price != null && ` · Student/Senior/PWD ${peso(plan.student_price)}`}
                      </p>
                      <ul className="mt-6 space-y-2 border-t border-paper/10 pt-5 text-paper/85">
                        <li>Full gym floor, cardio deck and free weights</li>
                        <li>{AMENITIES.slice(1).join(', ')}</li>
                        <li>{plan.days === 1 ? 'Pay at the front desk' : 'Personal QR pass for quick check-in'}</li>
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                  <SlideTextButton
                    href={plan.days === 1 ? '#visit' : '/signup'}
                    className="mt-7 w-full"
                    text={plan.days === 1 ? 'Walk in today' : 'Get your pass'}
                    hoverText={plan.days === 1 ? 'See hours' : 'Sign up free'}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {list?.length > 0 && (
          <details className="group mt-12 rounded-xl bg-mist">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-xl font-extrabold uppercase">
              Full price list
              <span aria-hidden="true" className="text-2xl leading-none transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <table className="tabular w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-smoke">
                <tr>
                  <th scope="col" className="px-5 pb-2 font-semibold">Plan</th>
                  <th scope="col" className="px-5 pb-2 text-right font-semibold">Price</th>
                  <th scope="col" className="hidden px-5 pb-2 text-right font-semibold sm:table-cell">Student/Senior/PWD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {list.map((p) => (
                  <tr key={p.code}>
                    <td className="px-5 py-3">
                      <span className="font-semibold">{p.name}</span>
                      {p.is_membership && <span className="block text-xs text-smoke">Yearly membership fee, separate from gym time</span>}
                      {p.members_only && <span className="block text-xs text-smoke">Needs a current annual membership</span>}
                      {p.student_price != null && <span className="block text-xs text-smoke sm:hidden">Student/Senior/PWD {peso(p.student_price)}</span>}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">{peso(p.price)}</td>
                    <td className="hidden px-5 py-3 text-right text-smoke sm:table-cell">{p.student_price != null ? peso(p.student_price) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-5 py-4 text-xs text-smoke">Student/Senior/PWD price with a valid ID at the front desk. Prices in Philippine pesos.</p>
          </details>
        )}
      </div>
    </section>
  )
}

const AMENITY_ICONS = [Car, Wifi, AirVent, Droplets, ShowerHead]

function Amenities() {
  return (
    <section id="amenities" className="bg-gold py-16 text-ink md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <Heading lines={['Included with every visit']} className="text-4xl! md:text-5xl!" />
        <motion.ul
          className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-ink/20"
          initial="out"
          whileInView="in"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.07 }}
        >
          {AMENITIES.map((a, i) => {
            const Icon = AMENITY_ICONS[i]
            return (
              <motion.li
                key={a}
                className="flex flex-col gap-3 lg:px-6 lg:first:pl-0"
                variants={{ out: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
              >
                <motion.span
                  className="w-fit"
                  variants={{ out: { scale: 0.6, rotate: -20 }, in: { scale: 1, rotate: 0 } }}
                  transition={{ type: 'spring', duration: 0.6, bounce: 0.35 }}
                >
                  <Icon className="size-9" strokeWidth={1.75} aria-hidden="true" />
                </motion.span>
                <span className="font-display text-2xl font-extrabold uppercase leading-none">{a}</span>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section id="faq" className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-8">
        <Heading lines={['Questions,', <span className="text-crimson">answered.</span>]} />
        <div className="mt-10 space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-xl bg-mist">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold">
                <h3 className="text-lg">{q}</h3>
                <span aria-hidden="true" className="text-2xl leading-none transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 text-smoke">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function Visit() {
  const today = new Date().getDay()
  const status = openStatus()
  const fmt = (t) => new Date(2000, 0, 1, +t.slice(0, 2), +t.slice(3)).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(GYM.mapsQuery)}`

  return (
    <section id="visit" className="mx-auto max-w-7xl px-4 py-20 sm:px-8 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <Heading lines={['Come train.']} />
          <address className="mt-6 flex gap-3 text-lg not-italic">
            <MapPin className="mt-1 size-5 shrink-0 text-crimson" aria-hidden="true" />
            {GYM.address}
          </address>
          <div className="mt-8">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-smoke">
              <Clock className="size-4" aria-hidden="true" /> Hours
              <span className={`ml-2 rounded-sm px-1.5 py-0.5 normal-case tracking-normal ${status.open ? 'bg-active/12 text-active' : 'bg-ink/8 text-smoke'}`}>{status.label}</span>
            </h3>
            <table className="tabular mt-3 w-full max-w-sm text-left">
              <tbody>
                {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                  const h = GYM.hours[d]
                  return (
                    <tr key={d} className={d === today ? 'font-bold' : 'text-smoke'}>
                      <td className="py-1">
                        {d === today && <span className="mr-2 inline-block size-1.5 rounded-full bg-crimson align-middle" aria-hidden="true" />}
                        {h.day}
                      </td>
                      <td className="py-1 text-right">
                        {fmt(h.open)} – {fmt(h.close)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={GYM.phoneHref} className="press inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 font-semibold text-paper">
              <Phone className="size-4 text-gold" aria-hidden="true" /> {GYM.phone}
            </a>
            <a href={GYM.facebook} target="_blank" rel="noreferrer" className="press inline-flex items-center gap-2 rounded-md border border-ink/15 px-4 py-3 font-semibold">
              <MessageCircle className="size-4 text-crimson" aria-hidden="true" /> couragedfitnesshub
            </a>
            <a href={`mailto:${GYM.email}`} className="press inline-flex items-center gap-2 rounded-md border border-ink/15 px-4 py-3 font-semibold">
              <Mail className="size-4 text-crimson" aria-hidden="true" /> {GYM.email}
            </a>
          </div>
        </div>
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <iframe
            title="Map to CourageD Fitness Hub"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(GYM.mapsQuery)}&z=17&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="min-h-80 w-full flex-1 rounded-xl border-0 bg-ink/5 grayscale-[0.3]"
          />
          <a href={directions} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 self-end text-sm font-semibold underline decoration-gold decoration-2 underline-offset-4">
            Get directions in Google Maps <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-ink text-ash">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm sm:px-8">
        <span className="flex items-center gap-2">
          <img src="/assets/logo.jpg" alt="" className="size-8 mix-blend-lighten" />© {new Date().getFullYear()} {GYM.name}
        </span>
        <nav aria-label="Legal" className="flex gap-5">
          <Link to="/privacy" className="hover:text-paper">Privacy</Link>
          <Link to="/terms" className="hover:text-paper">Terms</Link>
        </nav>
      </div>
    </footer>
  )
}
