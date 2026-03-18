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
  const [client, setClient] = useState(null)
  const [selCat, setSelCat] = useState(0)
  const [panier, setPanier] = useState([])
  const [saving, setSaving] = useState(false)

  const qrUrl = commercant?.slug
    ? `${window.location.origin}/rejoindre/${commercant.slug}`
    : `${window.location.origin}/rejoindre`

  useEffect(() => { if (user) loadClients() }, [user])
  useEffect(() => {
    setFiltered(clients.filter(c => c.nom_complet.toLowerCase().includes(search.toLowerCase())))
  }, [search, clients])

  useEffect(() => { if (user) loadCats() }, [user])

  async function loadClients() {
    const { data } = await supabase.from('clients').select('*').eq('commercant_id', user.id).order('created_at', { ascending: false })
    setClients(data || [])
  }

  async function loadCats() {
    const { data } = await supabase.from('categories').select('*').eq('commercant_id', user.id).eq('actif', true)
    if (data && data.length > 0) {
      setCats([{ nom: 'Tout', articles: data }, ...data.map(d => ({ nom: d.nom, articles: [d] }))])
    } else {
      setCats([
        { nom: 'Tout', articles: [
          { nom: 'Baguette', points_par_euro: 1, prix: '1,10€' },
          { nom: 'Croissant', points_par_euro: 2, prix: '1,20€' },
          { nom: 'Pain complet', points_par_euro: 2, prix: '1,80€' },
          { nom: 'Brioche', points_par_euro: 3, prix: '2,50€' },
          { nom: 'Éclair', points_par_euro: 3, prix: '2,80€' },
          { nom: 'Café', points_par_euro: 1, prix: '1,50€' },
        ]},
      ])
    }
  }

  const selectClient = (c) => {
    setClient(c); setPanier([]); setSelCat(0); setState('caisse')
  }

  const addArt = (art) => setPanier(p => [...p, art])

  const removeGroup = (nom) => {
    setPanier(p => {
      const idx = [...p].reverse().findIndex(x => x.nom === nom)
      if (idx === -1) return p
      return p.filter((_, i) => i !== p.length - 1 - idx)
    })
  }

  const total = panier.reduce((s, a) => s + (a.points_par_euro || 1), 0)
  const grouped = panier.reduce((acc, a) => {
    acc[a.nom] = acc[a.nom] || { pts: a.points_par_euro || 1, cnt: 0 }
    acc[a.nom].cnt++
    return acc
  }, {})

  const valider = async () => {
    setSaving(true)
    try {
      await supabase.rpc('crediter_points', {
        p_client_id: client.id,
        p_commercant_id: user.id,
        p_points: total,
        p_description: Object.entries(grouped).map(([n, g]) => `${n}${g.cnt > 1 ? ` ×${g.cnt}` : ''}`).join(', ')
      })
      await supabase.from('clients').update({ points: client.points + total }).eq('id', client.id)
      setState('succes')
      loadClients()
    } catch (e) {
      console.error(e)
      setState('succes')
    } finally {
      setSaving(false)
    }
  }

  const allArts = cats[selCat]?.articles || []

  if (state === 'succes') return (
    <div className={styles.page}>
      <div className={styles.topbar}><div className={styles.title}>Encaisser</div></div>
      <div className={styles.content} style={{maxWidth:460,margin:'0 auto'}}>
        <div className={styles.card} style={{textAlign:'center',padding:'40px 32px'}}>
          <div className={styles.succCircle}><svg viewBox="0 0 28 28" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M4 14l7 7L24 7"/></svg></div>
          <div className={styles.succTitle}>Points crédités !</div>
          <div className={styles.succSub}>{client?.nom_complet} a reçu ses points</div>
          <div className={styles.succPts}>+{total} pts</div>
          <div className={styles.succTotal}>Nouveau total : {(client.points + total).toLocaleString()} pts</div>
          <div className={styles.succRecap}>
            <div className={styles.recapTitle}>Articles encaissés</div>
            {Object.entries(grouped).map(([n, g]) => (
              <div key={n} className={styles.recapRow}><span>{n}{g.cnt > 1 ? ` ×${g.cnt}` : ''}</span><span>+{g.pts * g.cnt} pts</span></div>
            ))}
          </div>
          <button className={styles.btnBlue} onClick={() => { setState('home'); setClient(null); setSearch('') }}>
            Encaisser un autre client
          </button>
        </div>
      </div>
    </div>
  )

  if (state === 'caisse') return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div><div className={styles.title}>Encaissement — {client?.nom_complet}</div><div className={styles.sub}>Ajoutez les articles et validez</div></div>
        <button className={styles.btnBack} onClick={() => setState('home')}>← Retour</button>
      </div>
      <div className={styles.content}>
        <div className={styles.caisseLayout}>
          <div>
            <div className={styles.clientMini}>
              <div className={styles.cmAv} style={{background:'#2563EB'}}>{client?.nom_complet?.[0]}</div>
              <div><div className={styles.cmName}>{client?.nom_complet}</div><div className={styles.cmEmail}>{client?.email || client?.telephone}</div></div>
            </div>
            <div className={styles.ptsBig}>
              <div className={styles.ptsBigLbl}>Points actuels</div>
              <div className={styles.ptsBigVal}>{client?.points?.toLocaleString()}</div>
              <div className={styles.ptsBarBg}><div className={styles.ptsBarFill} style={{width:`${Math.min(100,(client.points/1000)*100)}%`}} /></div>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle} style={{marginBottom:14}}>Articles achetés</div>
            <div className={styles.catPills}>
              {cats.map((c, i) => <button key={c.nom} className={`${styles.catPill} ${i===selCat?styles.catActive:''}`} onClick={()=>setSelCat(i)}>{c.nom}</button>)}
            </div>
            <div className={styles.artsGrid}>
              {allArts.map((a, i) => {
                const cnt = panier.filter(p => p.nom === a.nom).length
                return (
                  <button key={i} className={`${styles.artBtn} ${cnt>0?styles.artSel:''}`} onClick={()=>addArt(a)}>
                    {cnt > 0 && <div className={styles.artCount}>×{cnt}</div>}
                    <div className={styles.artName}>{a.nom}</div>
                    <div className={styles.artPts}>+{a.points_par_euro||1} pt{(a.points_par_euro||1)>1?'s':''}</div>
                    {a.prix && <div className={styles.artPrice}>{a.prix}</div>}
                  </button>
                )
              })}
            </div>
            <div className={styles.panier}>
              <div className={styles.panTitle}>Panier</div>
              {panier.length === 0 ? <div className={styles.panEmpty}>Aucun article ajouté</div> : (
                <>
                  {Object.entries(grouped).map(([n, g]) => (
                    <div key={n} className={styles.panRow}>
                      <span className={styles.panName}>{n}{g.cnt>1?` ×${g.cnt}`:''}</span>
                      <span className={styles.panPts}>+{g.pts*g.cnt} pts</span>
                      <button className={styles.panDel} onClick={()=>removeGroup(n)}>✕</button>
                    </div>
                  ))}
                  <div className={styles.panTotal}><span>Points à créditer</span><span className={styles.panTotalPts}>+{total} pts</span></div>
                </>
              )}
            </div>
            <button className={styles.btnValider} disabled={panier.length===0||saving} onClick={valider}>
              {saving ? 'Crédit en cours...' : 'Valider et créditer les points'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div><div className={styles.title}>Encaisser</div><div className={styles.sub}>QR Code boutique + recherche client</div></div>
      </div>
      <div className={styles.content}>
        <div className={styles.twoCol}>

          {/* QR CODE BOUTIQUE — inchangé */}
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
                  <button className={styles.btnBlue} onClick={() => window.print()}>Imprimer</button>
                </div>
              </div>
            </div>
          </div>

          {/* RECHERCHE CLIENT — scanner supprimé */}
          <div className={styles.card}>
            <div className={styles.cardTitle} style={{marginBottom:4}}>Trouver un client</div>
            <div className={styles.cardSub} style={{marginBottom:14}}>Recherchez votre client par nom ou téléphone</div>
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
                ? <div style={{fontSize:13,color:'#CBD5E1',textAlign:'center',padding:16}}>Aucun client trouvé</div>
                : filtered.map(c => (
                  <div key={c.id} className={styles.clientRow} onClick={() => selectClient(c)}>
                    <div className={styles.cAv} style={{background:'#2563EB'}}>{c.nom_complet?.[0]}</div>
                    <div className={styles.cName}>{c.nom_complet}</div>
                    <div className={styles.cPts}>{c.points} pts</div>
                    <span style={{color:'#CBD5E1'}}>›</span>
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
