import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [commercant, setCommercant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On laisse UNIQUEMENT onAuthStateChange gérer l'état
    // Il se déclenche aussi au démarrage avec la session existante
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadCommercant(session.user.id)
      } else {
        setCommercant(null)
        setLoading(false)
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
      setCommercant(data)
    } catch (e) {
      console.error('Erreur chargement commerçant:', e.message)
      setCommercant(null)
    } finally {
      setLoading(false) // ← toujours appelé, même en cas d'erreur
    }
  }

  // ... reste inchangé
