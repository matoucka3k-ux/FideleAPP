import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'
import styles from './Encaisser.module.css'

export default function Encaisser() {
  const { user, commercant } = useAuth()
  const [state, setState] = useState('home')
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState([])
  const [filtered, setFiltered] = useState([])
  const [cats, setCats] = useState([])
  const [recompenses, setRecompenses] = useState([])
  const [client, setClient] = useState(null)
  const [selCat, setSelCat] = useState(0)
  const [panier, setPanier] = useState([])
  const [caisseTab, setCaisseTab] = useState('articles') // 'articles' | 'recompenses'
  const [saving, setSaving] = useState(false)
  const [recompenseUsed, setRecompenseUsed] = useState(null)

  const qrUrl = commercant?.slug
    ? `${window.location.origin}/rejoindre/${commercant.slug}`
    : `${window.location.origin}/rejoindre`

  // Échappe les caractères HTML pour éviter les injections XSS dans document.write
  const escapeHtml = (str) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  const handlePrint = () => {
    const safeName = escapeHtml(commercant?.nom_commerce || 'Ma boutique')
    const safeUrl = encodeURIComponent(qrUrl)
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code — ${safeName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #fff;
            }
            .container {
              text-align: center;
              padding: 40px;
              border: 2px dashed #E2E8F0;
              border-radius: 16px;
              max-width: 340px;
            }
            h1 { font-size: 20px; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
            p { font-size: 13px; color: #64748B; margin-bottom: 24px; line-height: 1.6; }
            img { width: 200px; height: 200px; }
            .url { font-size: 11px; color: #94A3B8; margin-top: 16px; word-break: break-all; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .container { border: 2px dashed #E2E8F0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${safeName}</h1>
            <p>Scannez ce QR code pour rejoindre<br/>notre programme de fidélité !</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${safeUrl}" />
            <div class="url">${escapeHtml(qrUrl)}</div>
          </div>
          <script>window.onload = () => { window.print(); window.onafterprint = () => window.close() }<\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  useEffect(() => { if (user) loadClients() }, [user])
  useEffect(() => {
    setFiltered(clients.filter(c => c.nom_complet.toLowerCase().includes(search.toLowerCase())))
  }, [search, clients])
  useEffect(() => { if (user) { loadCats(); loadRecompenses() } }, [user])

  async function loadClients() {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('commercant_id', user.id)
      .order('created_at', { ascending: false })
    setClients(data || [])
  }

  async function loadCats() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('commercant_id', user.id)
      .eq('actif', true)
      .order('created_at')

    if (data && data.length > 0) {
      const articles = data.map(d => ({
        id: d.id,
        nom: d.nom,
        points_par_euro: d.points_par_euro,
      }))
      setCats([{ nom: 'Tout', articles }])
    } else {
      setCats([{ nom: 'Tout', articles: [] }])
    }
  }

  async function loadRecompenses() {
    const { data } = await supabase
      .from('recompenses')
      .select('*')
      .eq('commercant_id', user.id)
      .order('points_requis', { ascending: true })
    setRecompenses(data || [])
  }

  const selectClient = (c) => {
    setClient(c)
    setPanier([])
    setSelCat(0)
    setCaisseTab('articles')
    setRecompenseUsed(null)
    setState('caisse')
  }

  const addArt = (art) => setPanier(p => [...p, art])

  const removeGroup = (nom) => {
    setPanier(p => {
      const idx = [...p].reverse().findIndex(x => x.nom === nom)
      if (idx === -1) return p
      return p.filter((_, i) => i !== p.length - 1 - idx)
    })
  }

  const total = panier.reduce((s, a) => s + (a.points_par_euro || 0), 0)
  const grouped = panier.reduce((acc, a) => {
    acc[a.nom] = acc[a.nom] || { pts: a.points_par_euro || 0, cnt: 0 }
    acc[a.nom].cnt++
    return acc
  }, {})

  // Récompenses disponibles pour ce client
  const recompensesDisponibles = recompenses.filter(r => client && client.points >= r.points_requis)
  const recompensesIndisponibles = recompenses.filter(r => client && client.points < r.points_requis)

  const valider = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.rpc('crediter_points', {
        p_client_id: client.id,
        p_commercant_id: user.id,
        p_points: total,
        p_description: Object.entries(grouped).map(([n, g]) => `${n}${g.cnt > 1 ? ` ×${g.cnt}` : ''}`).join(', ')
      })
      if (error) throw error
      setState('succes')
      loadClients()
    } catch (e) {
      console.error('Erreur crédit points:', e.message)
      alert('Erreur lors du crédit des points. Réessayez.')
    } finally {
      setSaving(false)
    }
  }

  const utiliserRecompense = async (recompense) => {
    if (client.points < recompense.points_requis) return
    setSaving(true)
    try {
      // Insérer transaction échange
      const { error: txError } = await supabase.from('transactions').insert({
        client_id: client.id,
        commercant_id: user.id,
        points: -recompense.points_requis,
        type: 'echange',
        description: recompense.nom,
      })
      if (txError) throw txError

      // Déduire les points dans clients ET adhesions pour garder la cohérence
      const newPoints = client.points - recompense.points_requis
      const { error: upError } = await supabase.from('clients')
        .update({ points: newPoints })
        .eq('id', client.id)
      if (upError) throw upError
      await supabase.from('adhesions')
        .update({ points: newPoints })
        .eq('client_id', client.id)
        .eq('commercant_id', user.id)

      setRecompenseUsed(recompense)
      setState('succes_recompense')
      loadClients()
    } catch (e) {
      console.error('Erreur échange récompense:', e.message)
      alert('Erreur lors de l\'échange. Réessayez.')
    } finally {
      setSaving(false)
    }
  }

  const allArts = cats[selCat]?.articles || []

  // ÉCRAN SUCCÈS RÉCOMPENSE
  if (state === 'succes_recompense') return (
    <div className={styles.page}>
      <div className={styles.topbar}><div className={styles.title}>Encaisser</div></div>
      <div className={styles.content} style={{ maxWidth: 460, margin: '0 auto' }}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '40px 32px' }}>
          <div className={styles.succCircle} style={{ background: '#FEF9C3', border: '2px solid #FDE68A' }}>
            <svg viewBox="0 0 28 28" fill="none" stroke="#D97706" strokeWidth="2.5"><path d="M14 5v8M14 17v2M6 14H4M24 14h-2M8.5 8.5l-1.4-1.4M20.9 20.9l-1.4-1.4M8.5 19.5l-1.4 1.4M20.9 7.1l-1.4 1.4"/></svg>
          </div>
          <div className={styles.succTitle}>Récompense utilisée !</div>
          <div className={styles.succSub}>{client?.nom_complet} a échangé ses points</div>
          <div className={styles.succPts} style={{ color: '#D97706' }}>−{recompenseUsed?.points_requis} pts</div>
          <div style={{ background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: 10, padding: '14px 18px', margin: '16px 0', fontSize: 15, fontWeight: 700, color: '#92400E' }}>
            🎁 {recompenseUsed?.nom}
          </div>
          <div className={styles.succTotal}>
            Points restants : {(client.points - (recompenseUsed?.points_requis || 0)).toLocaleString()} pts
          </div>
          <button className={styles.btnBlue} onClick={() => { setState('home'); setClient(null); setSearch(''); setRecompenseUsed(null) }}>
            Encaisser un autre client
          </button>
        </div>
      </div>
    </div>
  )

  // ÉCRAN SUCCÈS ACHAT
  if (state === 'succes') return (
    <div className={styles.page}>
      <div className={styles.topbar}><div className={styles.title}>Encaisser</div></div>
      <div className={styles.content} style={{ maxWidth: 460, margin: '0 auto' }}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '40px 32px' }}>
          <div className={styles.succCircle}><svg viewBox="0 0 28 28" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M4 14l7 7L24 7" /></svg></div>
          <div className={styles.succTitle}>Points crédités !</div>
          <div className={styles.succSub}>{client?.nom_complet} a reçu ses points</div>
          <div className={styles.succPts}>+{total} pts</div>
          <div className={styles.succTotal}>Nouveau total : {(client.points + total).toLocaleString()} pts</div>
          <div className={styles.succRecap}>
            <div className={styles.recapTitle}>Articles encaissés</div>
            {Object.entries(grouped).map(([n, g]) => (
              <div key={n} className={styles.recapRow}>
                <span>{n}{g.cnt > 1 ? ` ×${g.cnt}` : ''}</span>
                <span>+{g.pts * g.cnt} pts</span>
              </div>
            ))}
          </div>
          <button className={styles.btnBlue} onClick={() => { setState('home'); setClient(null); setSearch('') }}>
            Encaisser un autre client
          </button>
        </div>
      </div>
    </div>
  )

  // ÉCRAN CAISSE
  if (state === 'caisse') return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <div className={styles.title}>Encaissement — {client?.nom_complet}</div>
          <div className={styles.sub}>Ajoutez les articles ou utilisez une récompense</div>
        </div>
        <button className={styles.btnBack} onClick={() => setState('home')}>← Retour</button>
      </div>
      <div className={styles.content}>
        <div className={styles.caisseLayout}>
          <div>
            <div className={styles.clientMini}>
              <div className={styles.cmAv} style={{ background: '#2563EB' }}>{client?.nom_complet?.[0]}</div>
              <div>
                <div className={styles.cmName}>{client?.nom_complet}</div>
                <div className={styles.cmEmail}>{client?.email || client?.telephone}</div>
              </div>
            </div>
            <div className={styles.ptsBig}>
              <div className={styles.ptsBigLbl}>Points actuels</div>
              <div className={styles.ptsBigVal}>{client?.points?.toLocaleString()}</div>
              <div className={styles.ptsBarBg}>
                <div className={styles.ptsBarFill} style={{ width: `${Math.min(100, (client.points / 1000) * 100)}%` }} />
              </div>
            </div>
            {/* Badge récompenses disponibles */}
            {recompensesDisponibles.length > 0 && (
              <div style={{ marginTop: 12, background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#92400E' }}>
                🎁 {recompensesDisponibles.length} récompense{recompensesDisponibles.length > 1 ? 's' : ''} disponible{recompensesDisponibles.length > 1 ? 's' : ''} !
              </div>
            )}
          </div>

          <div className={styles.card}>
            {/* ONGLETS */}
            <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 9, padding: 3, marginBottom: 16 }}>
              <button
                onClick={() => setCaisseTab('articles')}
                style={{
                  flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', fontFamily: 'inherit',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: caisseTab === 'articles' ? '#fff' : 'none',
                  color: caisseTab === 'articles' ? '#2563EB' : '#64748B',
                  boxShadow: caisseTab === 'articles' ? '0 1px 3px rgba(0,0,0,.08)' : 'none'
                }}
              >
                Articles achetés
              </button>
              <button
                onClick={() => setCaisseTab('recompenses')}
                style={{
                  flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', fontFamily: 'inherit',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', position: 'relative',
                  background: caisseTab === 'recompenses' ? '#fff' : 'none',
                  color: caisseTab === 'recompenses' ? '#D97706' : '#64748B',
                  boxShadow: caisseTab === 'recompenses' ? '0 1px 3px rgba(0,0,0,.08)' : 'none'
                }}
              >
                Récompenses
                {recompensesDisponibles.length > 0 && (
                  <span style={{ position: 'absolute', top: 4, right: 8, width: 8, height: 8, background: '#F59E0B', borderRadius: '50%' }} />
                )}
              </button>
            </div>

            {/* ONGLET ARTICLES */}
            {caisseTab === 'articles' && (
              <>
                {allArts.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '24px 0', lineHeight: 1.6 }}>
                    Aucun article configuré.<br />
                    <span style={{ color: '#2563EB', fontWeight: 600 }}>Ajoutez vos articles dans "Système de points".</span>
                  </div>
                ) : (
                  <div className={styles.artsGrid}>
                    {allArts.map((a) => {
                      const cnt = panier.filter(p => p.nom === a.nom).length
                      return (
                        <button key={a.id} className={`${styles.artBtn} ${cnt > 0 ? styles.artSel : ''}`} onClick={() => addArt(a)}>
                          {cnt > 0 && <div className={styles.artCount}>×{cnt}</div>}
                          <div className={styles.artName}>{a.nom}</div>
                          <div className={styles.artPts}>+{a.points_par_euro} pt{a.points_par_euro > 1 ? 's' : ''}</div>
                        </button>
                      )
                    })}
                  </div>
                )}

                <div className={styles.panier}>
                  <div className={styles.panTitle}>Panier</div>
                  {panier.length === 0 ? (
                    <div className={styles.panEmpty}>Aucun article ajouté</div>
                  ) : (
                    <>
                      {Object.entries(grouped).map(([n, g]) => (
                        <div key={n} className={styles.panRow}>
                          <span className={styles.panName}>{n}{g.cnt > 1 ? ` ×${g.cnt}` : ''}</span>
                          <span className={styles.panPts}>+{g.pts * g.cnt} pts</span>
                          <button className={styles.panDel} onClick={() => removeGroup(n)}>✕</button>
                        </div>
                      ))}
                      <div className={styles.panTotal}>
                        <span>Points à créditer</span>
                        <span className={styles.panTotalPts}>+{total} pts</span>
                      </div>
                    </>
                  )}
                </div>
                <button className={styles.btnValider} disabled={panier.length === 0 || saving} onClick={valider}>
                  {saving ? 'Crédit en cours...' : 'Valider et créditer les points'}
                </button>
              </>
            )}

            {/* ONGLET RÉCOMPENSES */}
            {caisseTab === 'recompenses' && (
              <div>
                {recompenses.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '24px 0', lineHeight: 1.6 }}>
                    Aucune récompense configurée.<br />
                    <span style={{ color: '#2563EB', fontWeight: 600 }}>Ajoutez des récompenses dans "Système de points".</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Récompenses disponibles */}
                    {recompensesDisponibles.length > 0 && (
                      <>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>
                          Disponibles ({recompensesDisponibles.length})
                        </div>
                        {recompensesDisponibles.map(r => (
                          <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 10, padding: '12px 14px' }}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 3 }}>🎁 {r.nom}</div>
                              <div style={{ fontSize: 12, color: '#B45309', fontWeight: 600 }}>−{r.points_requis} pts</div>
                            </div>
                            <button
                              onClick={() => utiliserRecompense(r)}
                              disabled={saving}
                              style={{ background: '#F59E0B', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                            >
                              {saving ? '...' : 'Utiliser'}
                            </button>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Récompenses indisponibles */}
                    {recompensesIndisponibles.length > 0 && (
                      <>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 6, marginBottom: 2 }}>
                          Pas encore disponibles
                        </div>
                        {recompensesIndisponibles.map(r => (
                          <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', opacity: 0.6 }}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#64748B', marginBottom: 3 }}>🎁 {r.nom}</div>
                              <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                                {r.points_requis} pts requis · encore {r.points_requis - client.points} pts
                              </div>
                            </div>
                            <div style={{ background: '#E2E8F0', color: '#94A3B8', fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8 }}>
                              Indispo.
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // ÉCRAN HOME
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <div className={styles.title}>Encaisser</div>
          <div className={styles.sub}>QR Code boutique + recherche client</div>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.twoCol}>

          <div className={`${styles.card} ${styles.qrCard}`}>
            <div className={styles.qrBadge}>QR Code de votre boutique</div>
            <div className={styles.qrTitle}>Affichage en boutique — Inscription clients</div>
            <div className={styles.qrDesc}>Imprimez ce QR code et posez-le sur votre comptoir. Vos clients le scannent pour créer leur compte fidélité.</div>
            <div className={styles.qrBody}>
              <div className={styles.qrSvgWrap}>
                <QRCodeSVG value={qrUrl} size={100} fgColor="#0F172A" bgColor="#ffffff" level="M" />
              </div>
              <div>
                <div className={styles.qrUrl}>{qrUrl}</div>
                <div className={styles.qrHint}>Le client scanne → crée son compte → reçoit son QR code personnel</div>
                <div className={styles.qrBtns}>
                  <button className={styles.btnBlue} onClick={handlePrint}>Imprimer</button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle} style={{ marginBottom: 4 }}>Trouver un client</div>
            <div className={styles.cardSub} style={{ marginBottom: 14 }}>Recherchez votre client par nom ou téléphone</div>
            <div className={styles.searchWrap}>
              <input
                className={styles.searchInput}
                placeholder="Nom du client, téléphone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.clientList}>
              {filtered.length === 0
                ? <div style={{ fontSize: 13, color: '#CBD5E1', textAlign: 'center', padding: 16 }}>Aucun client trouvé</div>
                : filtered.map(c => (
                  <div key={c.id} className={styles.clientRow} onClick={() => selectClient(c)}>
                    <div className={styles.cAv} style={{ background: '#2563EB' }}>{c.nom_complet?.[0]}</div>
                    <div className={styles.cName}>{c.nom_complet}</div>
                    <div className={styles.cPts}>{c.points} pts</div>
                    <span style={{ color: '#CBD5E1' }}>›</span>
                  </div>
                ))
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

