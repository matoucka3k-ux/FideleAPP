import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase.js'
import styles from './ClientCard.module.css'

export default function ClientCard() {
  const [client, setClient] = useState(null)
  const [commercant, setCommercant] = useState(null)
  const [recompenses, setRecompenses] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    // Récupérer les données depuis la session
    const clientData = sessionStorage.getItem('client_data')
    const commercantData = sessionStorage.getItem('commercant_data')
    if (clientData) setClient(JSON.parse(clientData))
    if (commercantData) setCommercant(JSON.parse(commercantData))
  }, [])

  useEffect(() => {
    if (client) loadData()
  }, [client])

  async function loadData() {
    const [rewRes, txRes] = await Promise.all([
      supabase.from('recompenses').select('*').eq('commercant_id', client.commercant_id).eq('actif', true).order('points_requis'),
      supabase.from('transactions').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(10)
    ])
    setRecompenses(rewRes.data || [])
    setTransactions(txRes.data || [])
  }

  if (!client) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Plus Jakarta Sans,sans-serif',color:'#64748B',flexDirection:'column',gap:12}}>
      <div style={{fontSize:32}}>👋</div>
      <div style={{fontSize:16,fontWeight:700,color:'#0F172A'}}>Carte non trouvée</div>
      <div style={{fontSize:14,color:'#64748B'}}>Scannez le QR code de votre commerce pour vous inscrire.</div>
    </div>
  )

  const firstReward = recompenses.find(r => r.points_requis > client.points)
  const pct = firstReward ? Math.min(100, (client.points / firstReward.points_requis) * 100) : 100
  const qrValue = `${window.location.origin}/client/${client.id}`

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.shopRow}>
          <div className={styles.shopLogo}>{commercant?.nom_commerce?.[0] || '?'}</div>
          <div>
            <div className={styles.shopName}>{commercant?.nom_commerce || 'Programme de fidélité'}</div>
            <div className={styles.shopType}>Programme de fidélité</div>
          </div>
        </div>
        <div className={styles.greeting}>Bonjour {client.nom_complet?.split(' ')[0]} 👋</div>
        <div className={styles.ptsBig}>{client.points}</div>
        <div className={styles.ptsLabel}>points</div>
        <div className={styles.barBg}><div className={styles.barFill} style={{width:`${pct}%`}} /></div>
        <div className={styles.ptsNext}>
          {firstReward ? `Encore ${firstReward.points_requis - client.points} pts → ${firstReward.nom}` : 'Toutes les récompenses débloquées !'}
        </div>
      </div>

      <div className={styles.qrSection}>
        <div className={styles.qrTitle}>Mon QR code</div>
        <div className={styles.qrSub}>Le commerçant le scanne à la caisse pour créditer vos points</div>
        <div className={styles.qrBox}>
          <QRCodeSVG value={qrValue} size={110} fgColor="#0F172A" bgColor="#ffffff" level="M" />
        </div>
        <div className={styles.qrId}>{client.nom_complet} · #{client.id.slice(0,8).toUpperCase()}</div>
      </div>

      <div className={styles.body}>
        <div className={styles.sectionTitle}>Récompenses</div>
        <div className={styles.rewards}>
          {recompenses.map(r => (
            <div key={r.id} className={styles.rewardRow}>
              <div>
                <div className={styles.rewName}>{r.nom}</div>
                <div className={styles.rewPts}>{r.points_requis} pts</div>
              </div>
              <button className={client.points >= r.points_requis ? styles.rewBtnOk : styles.rewBtnNo}>
                {client.points >= r.points_requis ? 'Utiliser' : `${r.points_requis} pts`}
              </button>
            </div>
          ))}
          {recompenses.length === 0 && (
            <div style={{fontSize:13,color:'#CBD5E1',textAlign:'center',padding:'16px 0'}}>Aucune récompense pour l'instant</div>
          )}
        </div>

        <div className={styles.sectionTitle}>Historique</div>
        <div className={styles.history}>
          {transactions.map(t => (
            <div key={t.id} className={styles.histRow}>
              <div>
                <div className={styles.histLabel}>{t.description || t.type}</div>
                <div className={styles.histDate}>{new Date(t.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
              <div className={styles.histPts} style={{color: t.points > 0 ? '#2563EB' : '#DC2626'}}>
                {t.points > 0 ? '+' : ''}{t.points} pts
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div style={{fontSize:13,color:'#CBD5E1',textAlign:'center',padding:'16px 0'}}>Aucune transaction pour l'instant</div>
          )}
        </div>
      </div>
    </div>
  )
}
