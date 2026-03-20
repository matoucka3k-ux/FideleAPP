import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase.js'
import styles from './ClientCard.module.css'

export default function ClientCard() {
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [commercant, setCommercant] = useState(null)
  const [adhesions, setAdhesions] = useState([])
  const [recompenses, setRecompenses] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPicker, setShowPicker] = useState(false)

  // Formulaire de connexion (affiché quand pas de session)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const pickerRef = useRef(null)

  useEffect(() => {
    async function initClient() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) { setLoading(false); return }
        await loadClientFromSession(session.user.id)
      } catch {
        // pas de log pour éviter de fuiter des infos système
      }
      setLoading(false)
    }
    initClient()
  }, [])

  useEffect(() => {
    if (client?.commercant_id) loadData()
  }, [client?.id, client?.commercant_id])

  // Ferme le picker si on clique en dehors
  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadClientFromSession(userId) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', userId)
      .single()
    if (error || !data) return

    // Charge toutes les adhésions du client avec les infos commerçant
    const { data: adh } = await supabase
      .from('adhesions')
      .select('*, commercants(id, nom_commerce)')
      .eq('client_id', data.id)
    setAdhesions(adh || [])

    const commercantId = sessionStorage.getItem('fidele_commercant_id')
      || (adh?.[0]?.commercant_id ?? null)

    setClient(commercantId ? { ...data, commercant_id: commercantId } : data)
  }

  async function handleClientLogin(e) {
    e.preventDefault()
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setLoginError('Veuillez renseigner votre email et mot de passe.')
      return
    }
    setLoginLoading(true)
    setLoginError('')
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.email.trim(),
        password: loginForm.password,
      })
      if (authError) throw authError
      await loadClientFromSession(authData.user.id)
    } catch (e) {
      setLoginError('Email ou mot de passe incorrect.')
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleLogout() {
    sessionStorage.removeItem('fidele_client_id')
    sessionStorage.removeItem('fidele_commercant_id')
    await supabase.auth.signOut()
    // On reste sur /ma-carte pour pouvoir se reconnecter directement
    setClient(null)
    setCommercant(null)
    setAdhesions([])
    setRecompenses([])
    setTransactions([])
    setLoginForm({ email: '', password: '' })
    setLoginError('')
  }

  function switchCommerce(commercantId) {
    sessionStorage.setItem('fidele_commercant_id', commercantId)
    setClient(prev => ({ ...prev, commercant_id: commercantId }))
    setShowPicker(false)
  }

  async function loadData() {
    const [rewRes, txRes, adhRes, commRes] = await Promise.all([
      supabase.from('recompenses').select('*').eq('commercant_id', client.commercant_id).eq('actif', true).order('points_requis'),
      supabase.from('transactions').select('*').eq('client_id', client.id).eq('commercant_id', client.commercant_id).order('created_at', { ascending: false }).limit(10),
      supabase.from('adhesions').select('points').eq('client_id', client.id).eq('commercant_id', client.commercant_id).single(),
      supabase.from('commercants').select('*').eq('id', client.commercant_id).single(),
    ])
    setRecompenses(rewRes.data || [])
    setTransactions(txRes.data || [])
    if (adhRes.data) {
      setClient(prev => ({ ...prev, points: adhRes.data.points }))
    }
    if (commRes.data) {
      setCommercant(commRes.data)
    }
  }

  // ── Chargement initial ──────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#94A3B8', fontSize: 14 }}>
      Chargement...
    </div>
  )

  // ── Pas de session → formulaire de connexion ────────────────────
  if (!client) return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: '#F8FAFF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ background: '#2563EB', padding: '48px 24px 32px', color: '#fff', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
          🪪
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -.4 }}>Ma carte fidélité</div>
        <div style={{ fontSize: 13, opacity: .8, marginTop: 6, lineHeight: 1.5 }}>Connectez-vous pour accéder à vos points</div>
      </div>

      <form onSubmit={handleClientLogin} style={{ padding: '28px 20px' }}>
        {loginError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#DC2626', fontWeight: 600, marginBottom: 16 }}>
            {loginError}
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            placeholder="marie@email.fr"
            value={loginForm.email}
            onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
            style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>Mot de passe</label>
          <input
            type="password"
            placeholder="Votre mot de passe"
            value={loginForm.password}
            onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
            style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
          />
        </div>
        <button
          type="submit"
          disabled={loginLoading}
          style={{ width: '100%', background: '#2563EB', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, padding: 14, borderRadius: 9, cursor: loginLoading ? 'default' : 'pointer', fontFamily: 'inherit', opacity: loginLoading ? .7 : 1 }}
        >
          {loginLoading ? 'Connexion...' : 'Accéder à ma carte →'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#94A3B8', lineHeight: 1.8 }}>
          Pas encore de compte ?<br />
          <span style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/rejoindre')}>
            Scannez le QR code de votre commerce
          </span>
        </div>
      </form>
    </div>
  )

  // ── Client connecté mais aucune adhésion ────────────────────────
  if (!client.commercant_id) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', flexDirection: 'column', gap: 12, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Aucune enseigne</div>
      <div style={{ fontSize: 14, color: '#64748B' }}>Scannez le QR code d'un commerce pour rejoindre son programme.</div>
      <button onClick={handleLogout} style={{ marginTop: 12, background: 'none', border: '1.5px solid #E2E8F0', color: '#64748B', fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
        Déconnexion
      </button>
    </div>
  )

  const firstReward = recompenses.find(r => r.points_requis > (client.points ?? 0))
  const pct = firstReward ? Math.min(100, ((client.points ?? 0) / firstReward.points_requis) * 100) : 100
  const qrValue = `${window.location.origin}/ma-carte`
  const prenom = client.nom_complet?.split(' ')[0] || client.nom_complet

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.shopRow}>

          {/* ── Sélecteur d'enseigne (visible si ≥ 2 adhésions) ── */}
          {adhesions.length > 1 && (
            <div ref={pickerRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setShowPicker(v => !v)}
                title="Changer d'enseigne"
                style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}
              >
                ☰
              </button>

              {showPicker && (
                <div style={{ position: 'absolute', top: 44, left: 0, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,.18)', minWidth: 220, zIndex: 100, overflow: 'hidden', border: '1px solid #E8F0FE' }}>
                  <div style={{ padding: '10px 14px 6px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Mes enseignes
                  </div>
                  {adhesions.map(adh => {
                    const isActive = adh.commercant_id === client.commercant_id
                    return (
                      <button
                        key={adh.commercant_id}
                        onClick={() => switchCommerce(adh.commercant_id)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: isActive ? '#EFF6FF' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                      >
                        <div style={{ width: 32, height: 32, background: isActive ? '#2563EB' : '#F1F5F9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: isActive ? '#fff' : '#64748B', flexShrink: 0 }}>
                          {adh.commercants?.nom_commerce?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{adh.commercants?.nom_commerce || '—'}</div>
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{adh.points ?? 0} pts</div>
                        </div>
                        {isActive && <div style={{ fontSize: 10, color: '#2563EB', fontWeight: 800 }}>✓</div>}
                      </button>
                    )
                  })}
                  <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />
                  <div style={{ padding: '8px 14px 10px', fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>
                    Scannez un QR code pour rejoindre une nouvelle enseigne
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={styles.shopLogo}>{commercant?.nom_commerce?.[0]?.toUpperCase() || '?'}</div>
          <div style={{ flex: 1 }}>
            <div className={styles.shopName}>{commercant?.nom_commerce || 'Mon programme'}</div>
            <div className={styles.shopType}>Programme de fidélité</div>
          </div>

          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
            Déconnexion
          </button>
        </div>

        <div className={styles.greeting}>Bonjour {prenom} 👋</div>
        <div className={styles.ptsBig}>{client.points ?? 0}</div>
        <div className={styles.ptsLabel}>points</div>
        <div className={styles.barBg}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.ptsNext}>
          {firstReward
            ? `Encore ${firstReward.points_requis - (client.points ?? 0)} pts → ${firstReward.nom}`
            : recompenses.length > 0 ? 'Toutes les récompenses débloquées !' : 'Faites vos achats pour cumuler des points'}
        </div>
      </div>

      <div className={styles.qrSection}>
        <div className={styles.qrTitle}>Mon QR code</div>
        <div className={styles.qrSub}>Présentez-le à la caisse pour créditer vos points</div>
        <div className={styles.qrBox}>
          <QRCodeSVG value={qrValue} size={120} fgColor="#0F172A" bgColor="#ffffff" level="M" />
        </div>
        <div className={styles.qrId}>{client.nom_complet} · #{client.id.slice(0, 8).toUpperCase()}</div>
      </div>

      <div className={styles.body}>
        {recompenses.length > 0 && (
          <>
            <div className={styles.sectionTitle}>Récompenses</div>
            <div className={styles.rewards}>
              {recompenses.map(r => (
                <div key={r.id} className={styles.rewardRow}>
                  <div>
                    <div className={styles.rewName}>{r.nom}</div>
                    <div className={styles.rewPts}>{r.points_requis} pts</div>
                  </div>
                  <button className={(client.points ?? 0) >= r.points_requis ? styles.rewBtnOk : styles.rewBtnNo}>
                    {(client.points ?? 0) >= r.points_requis ? 'Disponible' : `${r.points_requis} pts`}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className={styles.sectionTitle}>Historique</div>
        <div className={styles.history}>
          {transactions.length === 0 ? (
            <div style={{ fontSize: 13, color: '#CBD5E1', textAlign: 'center', padding: '16px 0' }}>
              Aucune transaction pour l'instant
            </div>
          ) : (
            transactions.map(t => (
              <div key={t.id} className={styles.histRow}>
                <div>
                  <div className={styles.histLabel}>{t.description || t.type}</div>
                  <div className={styles.histDate}>{new Date(t.created_at).toLocaleDateString('fr-FR')}</div>
                </div>
                <div className={styles.histPts} style={{ color: t.points > 0 ? '#2563EB' : '#DC2626' }}>
                  {t.points > 0 ? '+' : ''}{t.points} pts
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

