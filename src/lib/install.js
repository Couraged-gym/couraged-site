// Chrome/Edge/Samsung fire beforeinstallprompt once the site is installable,
// often before the pass screen has loaded, so this listens from app start.
let deferred = null
const subs = new Set()
const notify = () => subs.forEach((f) => f())

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault() // our own button replaces Chrome's mini bar
  deferred = e
  notify()
})
window.addEventListener('appinstalled', () => {
  deferred = null
  notify()
})

export const subscribe = (f) => (subs.add(f), () => subs.delete(f))
export const canPrompt = () => deferred !== null

export async function promptInstall() {
  const e = deferred
  if (!e) return false
  deferred = null // a prompt event can only be used once
  e.prompt()
  const { outcome } = await e.userChoice
  notify()
  return outcome === 'accepted'
}

export const isInstalled = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
