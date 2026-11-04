import { lazy, Suspense, useCallback, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { AuthProvider } from './auth.jsx'
import Splash from './components/Splash.jsx'
import Home from './pages/Home.jsx'

// Member screens load on demand, so the home page stays light for visitors.
const Pass = lazy(() => import('./pages/Pass.jsx'))
const auth = () => import('./pages/Auth.jsx')
const SignIn = lazy(() => auth().then((m) => ({ default: m.SignIn })))
const SignUp = lazy(() => auth().then((m) => ({ default: m.SignUp })))
const Forgot = lazy(() => auth().then((m) => ({ default: m.Forgot })))
const Reset = lazy(() => auth().then((m) => ({ default: m.Reset })))
const legal = () => import('./pages/Legal.jsx')
const Privacy = lazy(() => legal().then((m) => ({ default: m.Privacy })))
const Terms = lazy(() => legal().then((m) => ({ default: m.Terms })))

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <BrowserRouter>
          <Screens />
        </BrowserRouter>
      </AuthProvider>
    </MotionConfig>
  )
}

function Screens() {
  // Brand splash only when someone lands on the home page, not when an email link opens the app.
  const first = useLocation().pathname === '/'
  const [booted, setBooted] = useState(!first)
  const done = useCallback(() => setBooted(true), [])
  return (
    <>
      <AnimatePresence>{!booted && <Splash key="splash" onDone={done} />}</AnimatePresence>
      {booted && (
        <Suspense fallback={<main className="min-h-dvh bg-ink" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pass" element={<Pass />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      )}
    </>
  )
}
