import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import styles from './ClientCard.module.css'

export default function ClientCard() {
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [commercant, setCommercant] = useState(null)
  const [adhesions, setAdhesions] = useState([])
  const [recompenses, setRecompenses] = useState([])
  const [transactions, setTransactions] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('carte')
  const [showPicker, setShowPicker] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [editAccount, setEditAccount] = useState(false)
  const [accountForm, setAccountForm] = useState({ nom_complet: '', telephone: '' })
  const [savingAccount, setSavingAccount] = useState(false)
  const [accountMsg, setAccountMsg] = useState('')

  const pickerRef = useRef(null)

  useEffect(() => {
    async function initClient() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) { setLoading(false); return }
        await loadClientFromSession(session.user.id)
      } catch { /* silent */ }
      setLoading(false)
    }
    initClient()
  }, [])

  useEffect(() => {
    if (client?.id && client?.commercant_id) loadData()
  }, [client?.id, client?.commercant_id])

  useEffect(() => {
    const handleVisible = () => {
      if (!document.hidden && client?.id && client?.commercant_id) loadData()
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => document.removeEventListener('visibilitychange', handleVisible)
  }, [client?.id, client?.commercant_id])

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
    let { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!data && !error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const { data: byEmail } = await supabase
          .from('clients')
          .select('*')
          .eq('email', user.email)
          .maybeSingle()
        data = byEmail
      }
    }

    if (!data) return

    const { data: adh } = await supabase
      .from('adhesions')
      .select('*, commercants(id, nom_commerce)')
      .eq('client_id', data.id)

    setAdhesions(adh || [])

    const commercantId = sessionStorage.getItem('fidele_commercant_id')
      || (adh?.[0]?.commercant_id ?? null)

    setClient(commercantId ? { ...data, commercant_id: commercantId } : data)
  }

  function parseSupabaseError(err) {
    const msg = err?.message || ''
    if (msg.includes('Email not confirmed') || msg.includes('email_not_confirmed')) {
      return 'Votre email n\'est pas encore confirmé. Vérifiez votre boîte mail (et vos spams).'
    }
    if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
      return 'Email ou mot de passe incorrect.'
    }
    if (msg.includes('too many requests') || msg.includes('rate limit')) {
      return 'Trop de tentatives. Attendez quelques minutes avant de réessayer.'
    }
    return msg || 'Une erreur est survenue. Réessayez.'
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
    } catch (err) {
      setLoginError(parseSupabaseError(err))
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleLogout() {
    sessionStorage.removeItem('fidele_client_id')
    sessionStorage.removeItem('fidele_commercant_id')
    await supabase.auth.signOut()
    setClient(null)
    setCommercant(null)
    setAdhesions([])
    setRecompenses([])
    setTransactions([])
    setMessages([])
    setLoginForm({ email: '', password: '' })
    setLoginError('')
    setTab('carte')
  }

  function switchCommerce(commercantId) {
    sessionStorage.setItem('fidele_commercant_id', commercantId)
    setClient(prev => ({ ...prev, commercant_id: commercantId }))
    setShowPicker(false)
  }

  async function loadData() {
    const [rewRes, txRes, adhRes, commRes, msgRes] = await Promise.all([
      supabase.from('recompenses').select('*').eq('commercant_id', client.commercant_id).eq('actif', true).order('points_requis'),
      supabase.from('transactions').select('*').eq('client_id', client.id).eq('commercant_id', client.commercant_id).order('created_at', { ascending: false }).limit(30),
      supabase.from('adhesions').select('points').eq('client_id', client.id).eq('commercant_id', client.commercant_id).maybeSingle(),
      supabase.from('commercants').select('*').eq('id', client.commercant_id).single(),
      supabase.from('messages_commercants').select('*').eq('commercant_id', client.commercant_id).order('created_at', { ascending: false }).limit(10),
    ])
    setRecompenses(rewRes.data || [])
    setTransactions(txRes.data || [])
    setMessages(msgRes.data || [])
    const freshPoints = adhRes.data?.points ?? 0  // ← FIX: points isolés par marchand
    setClient(prev => ({ ...prev, points: freshPoints }))
    if (commRes.data) setCommercant(commRes.data)
  }

  async function saveAccount() {
    if (!accountForm.nom_complet.trim()) {
      setAccountMsg('Le nom est requis.')
      return
    }
    setSavingAccount(true)
    setAccountMsg('')
    try {
      const { error } = await supabase
        .from('clients')
        .update({ nom_complet: accountForm.nom_complet.trim(), telephone: accountForm.telephone.trim() })
        .eq('id', client.id)
      if (error) throw error
      setClient(prev => ({ ...prev, nom_complet: accountForm.nom_complet.trim(), telephone: accountForm.telephone.trim() }))
      setEditAccount(false)
      setAccountMsg('Profil mis à jour avec succès !')
    } catch {
      setAccountMsg('Erreur lors de la mise à jour.')
    } finally {
      setSavingAccount(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#94A3B8', fontSize: 14 }}>
      Chargement...
    </div>
  )

  if (!client) return (
    <div className={styles.loginPage}>
      <div className={styles.loginHeader}>
        <div className={styles.loginIcon}>🪪</div>
        <div className={styles.loginTitle}>Ma carte fidélité</div>
        <div className={styles.loginSub}>Connectez-vous pour accéder à vos points</div>
      </div>
      <form onSubmit={handleClientLogin} className={styles.loginForm}>
        {loginError && <div className={styles.errorBox}>{loginError}</div>}
        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            placeholder="marie@email.fr"
            value={loginForm.email}
            onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
            autoComplete="email"
          />
        </div>
        <div className={styles.field}>
          <label>Mot de passe</label>
          <input
            type="password"
            placeholder="Votre mot de passe"
            value={loginForm.password}
            onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={loginLoading}
          style={{ opacity: loginLoading ? .7 : 1, marginTop: 6 }}
        >
          {loginLoading ? 'Connexion...' : 'Accéder à ma carte →'}
        </button>
        <div className={styles.loginFooter}>
          Pas encore de compte ?<br />
          <span className={styles.link} onClick={() => navigate('/rejoindre')}>
            Scannez le QR code de votre commerce
          </span>
        </div>
      </form>
    </div>
  )

  if (!client.commercant_id) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', flexDirection: 'column', gap: 12, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Aucune enseigne</div>
      <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>Scannez le QR code d'un commerce pour rejoindre son programme de fidélité.</div>
      <button onClick={handleLogout} style={{ marginTop: 12, background: 'none', border: '1.5px solid #E2E8F0', color: '#64748B', fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
        Déconnexion
      </button>
    </div>
  )

  const firstReward = recompenses.find(r => r.points_requis > (client.points ?? 0))
  const pct = firstReward ? Math.min(100, ((client.points ?? 0) / firstReward.points_requis) * 100) : 100
  const prenom = client.nom_complet?.split(' ')[0] || client.nom_complet

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <div className={styles.shopRow}>

          {adhesions.length > 1 && (
            <div ref={pickerRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setShowPicker(v => !v)} className={styles.pickerBtn}>☰</button>
              {showPicker && (
                <div className={styles.pickerDropdown}>
                  <div className={styles.pickerTitle}>Mes enseignes</div>
                  {adhesions.map(adh => {
                    const isActive = adh.commercant_id === client.commercant_id
                    return (
                      <button
                        key={adh.commercant_id}
                        onClick={() => switchCommerce(adh.commercant_id)}
                        className={styles.pickerItem}
                        style={{ background: isActive ? '#EFF6FF' : 'transparent' }}
                      >
                        <div className={styles.pickerLogo} style={{ background: isActive ? '#2563EB' : '#F1F5F9', color: isActive ? '#fff' : '#64748B' }}>
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
                </div>
              )}
            </div>
          )}

          <div className={styles.shopLogo}>{commercant?.nom_commerce?.[0]?.toUpperCase() || '?'}</div>
          <div style={{ flex: 1 }}>
            <div className={styles.shopName}>{commercant?.nom_commerce || 'Mon programme'}</div>
            <div className={styles.shopType}>Programme de fidélité</div>
          </div>
        </div>

        {tab === 'carte' && (
          <>
            <div className={styles.greeting}>Bonjour {prenom} 👋</div>
            <div className={styles.ptsBig}>{client.points ?? 0}</div>
            <div className={styles.ptsLabel}>points</div>
            <div className={styles.barBg}>
              <div className={styles.barFill} style={{ width: `${pct}%` }} />
            </div>
            <div className={styles.ptsNext}>
              {firstReward
                ? `Encore ${firstReward.points_requis - (client.points ?? 0)} pts → ${firstReward.nom}`
                : recompenses.length > 0
                  ? 'Toutes les récompenses débloquées !'
                  : 'Faites vos achats pour cumuler des points'}
            </div>
          </>
        )}
        {tab === 'points' && (
          <div style={{ paddingBottom: 4 }}>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -.3 }}>Mes points & récompenses</div>
            <div style={{ fontSize: 12, opacity: .75, marginTop: 4 }}>{client.points ?? 0} points disponibles</div>
          </div>
        )}
        {tab === 'messages' && (
          <div style={{ paddingBottom: 4 }}>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -.3 }}>Messages</div>
            <div style={{ fontSize: 12, opacity: .75, marginTop: 4 }}>De {commercant?.nom_commerce}</div>
          </div>
        )}
        {tab === 'compte' && (
          <div style={{ paddingBottom: 4 }}>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -.3 }}>Mon compte</div>
            <div style={{ fontSize: 12, opacity: .75, marginTop: 4 }}>{client.email}</div>
          </div>
        )}
      </div>

      <div className={styles.body}>

        {tab === 'carte' && (
          <>
            {recompenses.length > 0 && (
              <>
                <div className={styles.sectionTitle}>Prochaines récompenses</div>
                <div className={styles.rewards}>
                  {recompenses.slice(0, 3).map(r => (
                    <div key={r.id} className={styles.rewardRow}>
                      <div>
                        <div className={styles.rewName}>{r.nom}</div>
                        <div className={styles.rewPts}>{r.points_requis} pts</div>
                      </div>
                      <button className={(client.points ?? 0) >= r.points_requis ? styles.rewBtnOk : styles.rewBtnNo}>
                        {(client.points ?? 0) >= r.points_requis ? '✓ Disponible' : `${r.points_requis} pts`}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className={styles.sectionTitle}>Dernières transactions</div>
            <div className={styles.history}>
              {transactions.length === 0 ? (
                <div style={{ fontSize: 13, color: '#CBD5E1', textAlign: 'center', padding: '16px 0' }}>
                  Aucune transaction pour l'instant
                </div>
              ) : (
                transactions.slice(0, 5).map(t => (
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
          </>
        )}

        {tab === 'points' && (
          <>
            <div className={styles.pointsSummary}>
              <div className={styles.pointsSummaryBig}>{client.points ?? 0}</div>
              <div style={{ fontSize: 14, opacity: .85, fontWeight: 600, marginTop: 4 }}>points disponibles</div>
              {firstReward && (
                <>
                  <div className={styles.summaryBar}>
                    <div style={{ background: 'rgba(255,255,255,.4)', borderRadius: 999, height: 5, flex: 1 }}>
                      <div style={{ background: '#fff', borderRadius: 999, height: 5, width: `${pct}%`, transition: 'width .4s' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, opacity: .8, marginTop: 4 }}>
                    Encore {firstReward.points_requis - (client.points ?? 0)} pts → {firstReward.nom}
                  </div>
                </>
              )}
            </div>

            {recompenses.length > 0 ? (
              <>
                <div className={styles.sectionTitle}>Toutes les récompenses</div>
                <div className={styles.rewards}>
                  {recompenses.map(r => {
                    const unlocked = (client.points ?? 0) >= r.points_requis
                    return (
                      <div key={r.id} className={styles.rewardRow} style={{ opacity: unlocked ? 1 : .75 }}>
                        <div style={{ flex: 1 }}>
                          <div className={styles.rewName}>{r.nom}</div>
                          <div className={styles.rewPts}>{r.points_requis} pts requis</div>
                          {!unlocked && (
                            <div style={{ marginTop: 6 }}>
                              <div style={{ background: '#E8F0FE', borderRadius: 999, height: 4 }}>
                                <div style={{ background: '#2563EB', borderRadius: 999, height: 4, width: `${Math.min(100, ((client.points ?? 0) / r.points_requis) * 100)}%`, transition: 'width .4s' }} />
                              </div>
                              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>
                                Encore {r.points_requis - (client.points ?? 0)} pts
                              </div>
                            </div>
                          )}
                        </div>
                        <button className={unlocked ? styles.rewBtnOk : styles.rewBtnNo}>
                          {unlocked ? '✓ Disponible' : 'Verrouillé'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: 13 }}>
                Aucune récompense configurée pour ce commerce.
              </div>
            )}

            <div className={styles.sectionTitle}>Historique complet</div>
            <div className={styles.history}>
              {transactions.length === 0 ? (
                <div style={{ fontSize: 13, color: '#CBD5E1', textAlign: 'center', padding: '16px 0' }}>
                  Aucune transaction
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
          </>
        )}

        {tab === 'messages' && (
          <>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>💬</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Aucun message</div>
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                  {commercant?.nom_commerce} n'a pas encore envoyé de messages.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.map(m => (
                  <div key={m.id} className={styles.msgCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div className={styles.msgAvatar}>{commercant?.nom_commerce?.[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{commercant?.nom_commerce}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{new Date(m.created_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </div>
                    {(m.titre || m.title) && (
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>{m.titre || m.title}</div>
                    )}
                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                      {m.contenu || m.message || m.texte || m.body || ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'compte' && (
          <>
            <div className={styles.accountCard}>
              <div className={styles.accountAvatar}>{prenom?.[0]?.toUpperCase() || '?'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{client.nom_complet}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>{client.email}</div>
              </div>
            </div>

            {accountMsg && (
              <div style={{
                background: accountMsg.includes('Erreur') ? '#FEF2F2' : '#F0FDF4',
                border: `1px solid ${accountMsg.includes('Erreur') ? '#FECACA' : '#BBF7D0'}`,
                borderRadius: 9, padding: '10px 14px', fontSize: 13,
                color: accountMsg.includes('Erreur') ? '#DC2626' : '#16A34A',
                fontWeight: 600, marginBottom: 14,
              }}>
                {accountMsg}
              </div>
            )}

            {!editAccount ? (
              <div className={styles.infoSection}>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Nom complet</div>
                  <div className={styles.infoValue}>{client.nom_complet || '—'}</div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Email</div>
                  <div className={styles.infoValue}>{client.email}</div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Téléphone</div>
                  <div className={styles.infoValue}>{client.telephone || '—'}</div>
                </div>
                <div className={styles.infoRow} style={{ borderBottom: 'none' }}>
                  <div className={styles.infoLabel}>Membre depuis</div>
                  <div className={styles.infoValue}>{client.created_at ? new Date(client.created_at).toLocaleDateString('fr-FR') : '—'}</div>
                </div>
                <button
                  className={styles.btnSecondary}
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setAccountForm({ nom_complet: client.nom_complet || '', telephone: client.telephone || '' })
                    setEditAccount(true)
                    setAccountMsg('')
                  }}
                >
                  ✏️ Modifier mon profil
                </button>
              </div>
            ) : (
              <div className={styles.infoSection} style={{ padding: '14px' }}>
                <div className={styles.field}>
                  <label>Nom complet</label>
                  <input
                    type="text"
                    value={accountForm.nom_complet}
                    onChange={e => setAccountForm(f => ({ ...f, nom_complet: e.target.value }))}
                    placeholder="Marie Dupont"
                  />
                </div>
                <div className={styles.field} style={{ marginBottom: 0 }}>
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={accountForm.telephone}
                    onChange={e => setAccountForm(f => ({ ...f, telephone: e.target.value }))}
                    placeholder="06 12 34 56 78"
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button className={styles.btnPrimary} style={{ flex: 1 }} onClick={saveAccount} disabled={savingAccount}>
                    {savingAccount ? 'Sauvegarde...' : 'Enregistrer'}
                  </button>
                  <button className={styles.btnSecondary} style={{ flex: 1, marginTop: 0 }} onClick={() => { setEditAccount(false); setAccountMsg('') }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <div className={styles.sectionTitle} style={{ marginTop: 24 }}>Mes enseignes ({adhesions.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {adhesions.map(adh => {
                const isActive = adh.commercant_id === client.commercant_id
                return (
                  <div
                    key={adh.commercant_id}
                    className={styles.rewardRow}
                    style={{ cursor: 'pointer', background: isActive ? '#EFF6FF' : '#fff', borderColor: isActive ? '#BFDBFE' : '#E8F0FE' }}
                    onClick={() => switchCommerce(adh.commercant_id)}
                  >
                    <div style={{ width: 38, height: 38, background: isActive ? '#2563EB' : '#F1F5F9', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: isActive ? '#fff' : '#64748B', flexShrink: 0 }}>
                      {adh.commercants?.nom_commerce?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, marginLeft: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{adh.commercants?.nom_commerce || '—'}</div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{adh.points ?? 0} points</div>
                    </div>
                    {isActive && <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 700, background: '#DBEAFE', padding: '3px 8px', borderRadius: 999 }}>actif</div>}
                  </div>
                )
              })}
            </div>

            <button onClick={handleLogout} className={styles.btnDanger}>
              Déconnexion
            </button>
          </>
        )}
      </div>

      <div className={styles.bottomNav}>
        <button onClick={() => setTab('carte')} className={tab === 'carte' ? styles.navItemActive : styles.navItem}>
          <span className={styles.navIcon}>🪪</span>
          <span>Ma carte</span>
        </button>
        <button onClick={() => setTab('points')} className={tab === 'points' ? styles.navItemActive : styles.navItem}>
          <span className={styles.navIcon}>⭐</span>
          <span>Mes points</span>
        </button>
        <button onClick={() => setTab('messages')} className={tab === 'messages' ? styles.navItemActive : styles.navItem}>
          <span className={styles.navIcon}>💬</span>
          <span>Messages</span>
        </button>
        <button onClick={() => setTab('compte')} className={tab === 'compte' ? styles.navItemActive : styles.navItem}>
          <span className={styles.navIcon}>👤</span>
          <span>Mon compte</span>
        </button>
      </div>
    </div>
  )
}

