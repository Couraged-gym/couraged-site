import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'

const AuthCtx = createContext(null)

// session / member: undefined = still loading, null = none.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(supabase ? undefined : null)
  const [recovery, setRecovery] = useState(false)
  const [loaded, setLoaded] = useState(null) // { uid, member } for the last fetched user

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      setSession(s)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const uid = session?.user.id
  const refresh = useCallback(async () => {
    if (!uid) return
    const { data, error } = await supabase.rpc('member_me')
    setLoaded({ uid, member: error ? undefined : (data?.[0] ?? null), error })
  }, [uid])
  useEffect(() => {
    refresh()
  }, [refresh])

  // Derived, so a just-arrived session never renders against the previous user's pass.
  const mine = loaded?.uid === uid ? loaded : null
  const member = session === undefined ? undefined : !uid ? null : mine ? mine.member : undefined

  const value = { session, member, memberError: mine?.error ?? null, recovery, refresh, signOut: () => supabase.auth.signOut() }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
