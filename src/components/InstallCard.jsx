import { useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Download, EllipsisVertical, Share, Smartphone, SquarePlus, X } from 'lucide-react'
import { canPrompt, isInstalled, promptInstall, subscribe } from '../lib/install.js'
import { EASE_OUT } from './ui.jsx'

const DISMISSED = 'cd-install-dismissed'
const wasDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED) === 'yes'
  } catch {
    return false
  }
}

const ua = navigator.userAgent
const inAppBrowser = /FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|TikTok/i.test(ua)
const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const android = /Android/.test(ua)
const samsung = /SamsungBrowser/.test(ua)

const Step = ({ n, children }) => (
  <li className="flex items-start gap-3">
    <span className="tabular grid size-6 shrink-0 place-items-center rounded-full bg-gold font-bold text-ink text-xs">{n}</span>
    <span className="flex flex-wrap items-center gap-1">{children}</span>
  </li>
)
const Key = ({ Icon, children }) => (
  <span className="inline-flex items-center gap-1 rounded-md bg-paper/10 px-1.5 py-0.5 font-semibold text-paper">
    {Icon && <Icon className="size-4" aria-hidden="true" />}
    {children}
  </span>
)

// "Get the app" card for the pass screen. Hidden once installed or dismissed.
export default function InstallCard() {
  const prompt = useSyncExternalStore(subscribe, canPrompt)
  const [hidden, setHidden] = useState(() => isInstalled() || wasDismissed())
  const [steps, setSteps] = useState(false)

  // Desktop with no install offer: nothing useful to say.
  if (hidden || (!prompt && !ios && !android)) return null

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED, 'yes')
    } catch {
      /* private mode: just hide for now */
    }
    setHidden(true)
  }
  const install = async () => {
    if (await promptInstall()) setHidden(true)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="relative mt-4 rounded-2xl bg-ink-2 p-5 ring-1 ring-gold/40"
    >
      <button type="button" onClick={dismiss} aria-label="Not now" className="absolute top-2 right-2 grid size-10 place-items-center rounded-full text-ash hover:text-paper">
        <X className="size-4" aria-hidden="true" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <Smartphone className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
        <div>
          <h2 className="font-semibold">Get the CourageD app</h2>
          <p className="mt-1 text-sm text-ash">Opens straight to your pass from your home screen, even on weak signal.</p>
        </div>
      </div>

      {prompt ? (
        <button type="button" onClick={install} className="press mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gold font-display text-lg font-extrabold uppercase tracking-[0.06em] text-ink">
          <Download className="size-5" aria-hidden="true" /> Install the app
        </button>
      ) : (
        <>
          <button type="button" aria-expanded={steps} onClick={() => setSteps((s) => !s)} className="press mt-4 h-11 w-full rounded-lg font-semibold ring-1 ring-paper/15">
            {steps ? 'Hide steps' : 'Show me how'}
          </button>
          <AnimatePresence initial={false}>
            {steps && (
              <motion.ol
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
                className="space-y-3 overflow-hidden pt-4 text-sm text-ash"
              >
                {inAppBrowser ? (
                  <>
                    <Step n={1}>
                      Tap <Key Icon={EllipsisVertical}>menu</Key> at the top of this screen.
                    </Step>
                    <Step n={2}>
                      Choose <Key>Open in {ios ? 'Safari' : 'Chrome'}</Key> (or "Open in browser").
                    </Step>
                    <Step n={3}>Come back to this card there to install.</Step>
                  </>
                ) : ios ? (
                  <>
                    <Step n={1}>
                      Tap <Key Icon={Share}>Share</Key> in the toolbar.
                    </Step>
                    <Step n={2}>
                      Scroll down and tap <Key Icon={SquarePlus}>Add to Home Screen</Key>.
                    </Step>
                    <Step n={3}>
                      Tap <Key>Add</Key>.
                    </Step>
                  </>
                ) : samsung ? (
                  <>
                    <Step n={1}>
                      Tap the <Key>≡</Key> menu at the bottom.
                    </Step>
                    <Step n={2}>
                      Tap <Key>Add page to</Key> then <Key>Home screen</Key>.
                    </Step>
                  </>
                ) : (
                  <>
                    <Step n={1}>
                      Open this page in <Key>Chrome</Key>.
                    </Step>
                    <Step n={2}>
                      Tap <Key Icon={EllipsisVertical}>menu</Key> at the top right.
                    </Step>
                    <Step n={3}>
                      Tap <Key>Install app</Key>, or <Key>Add to Home screen</Key> then <Key>Install</Key>.
                    </Step>
                    <li className="text-xs">
                      Still no icon? Some phones (Xiaomi, Oppo, Vivo, Realme) block it: in Settings › Apps › Chrome, allow "Home screen shortcuts", then try again.
                    </li>
                  </>
                )}
              </motion.ol>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.section>
  )
}
