import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

const CACHE_KEY = 'fidele_commercant'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [commercant, setCommercant] = useState(() => {
    // Charge le cache immédiatement — affichage instantané sans attendre le réseau
    // sessionStorage (effacé à la fermeture du navigateur, non persisté sur disque)
    try { return JSON.parse(sessionStorage.getItem(CACHE_KEY)) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        // Si on a déjà le cache, on enlève le spinner tout de suite
        // et on rafraîchit en arrière-plan
        if (sessionStorage.getItem(CACHE_KEY)) setLoading(false)
        loadCommercant(u.id)
      } else {
        sessionStorage.removeItem(CACHE_KEY)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) {
        sessionStorage.removeItem(CACHE_KEY)
        setCommercant(null)
        setLoading(false)
      }
      if (u && (_event === 'SIGNED_IN' || _event === 'USER_UPDATED')) {
        loadCommercant(u.id)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadCommercant(userId) {
    try {
      const { data, error } = await supabase
        .from('commercants')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
      setCommercant(data)
    } catch (e) {
      console.error('Erreur chargement commerçant:', e.message)
      setCommercant(null)
    } finally {
      setLoading(false)
    }
  }

  async function signUp({ nomComplet, nomCommerce, typeCommerce, email, password }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    const baseSlug = nomCommerce
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const randomSuffix = Math.random().toString(36).slice(2, 8)
    const slug = `${baseSlug}-${randomSuffix}`
    const { error: profileError } = await supabase
      .from('commercants')
      .insert({
        id: data.user.id,
        nom_complet: nomComplet,
        nom_commerce: nomCommerce,
        type_commerce: typeCommerce,
        email,
        slug,
        points_par_euro: 1,
        bonus_bienvenue: 100,
        plan: 'beta'
      })
    if (profileError) throw profileError
    return data
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    sessionStorage.clear()
    setUser(null)
    setCommercant(null)
  }

  async function updateCommercant(updates) {
    const { data, error } = await supabase
      .from('commercants')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error
    setCommercant(data)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, commercant, loading, signUp, signIn, signOut, updateCommercant }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
