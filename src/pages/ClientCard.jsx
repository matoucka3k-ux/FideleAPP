import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase.js'
import styles from './ClientCard.module.css'

export default function ClientCard() {
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [commercant, setCommercant] = useState(null)
  const [recompenses, setRecompenses] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initClient() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) { setLoading(false); return }
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (error || !data) { setLoading(false); return }
        const commercantId = sessionStorage.getItem('fidele_commercant_id')
        setClient(commercantId ? { ...data, commercant_id: commercantId } : data)
      } catch {
        // pas de log pour éviter de fuiter des infos système
      }
      setLoading(false)
    }
    initClient()
  }, [])

  useEffect(() => {
    if (client) loadData()
  }, [client])

  async function handleLogout() {
    sessionStorage.removeItem('fidele_client_id')
    sessionStorage.removeItem('fidele_commercant_id')
    await supabase.auth.signOut()
    navigate('/')
  }

  async function loadData() {
    const [rewRes, txRes, clientRes, commRes] = await Promise.all([
      supabase.from('recompenses').select('*').eq('commercant_id', client.commercant_id).eq('actif', true).order('points_requis'),
      supabase.from('transactions').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('clients').select('points').eq('id', client.id).single(),
      supabase.from('commercants').select('*').eq('id', client.commercant_id).single(),
    ])
    setRecompenses(rewRes.data || [])
    setTransactions(txRes.data || [])
    if (clientRes.data) {
      setClient(prev => ({ ...prev, points: clientRes.data.points }))
    }
    if (commRes.data) {
      setCommercant(commRes.data)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#94A3B8', fontSize: 14 }}>
      Chargement...
    </div>
  )

  if (!client) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', flexDirection: 'column', gap: 12, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Carte introuvable</div>
      <div style={{ fontSize: 14, color: '#64748B' }}>Scannez le QR code de votre commerce pour vous inscrire.</div>
    </div>
  )

  const firstReward = recompenses.find(r => r.points_requis > client.points)
  const pct = firstReward ? Math.min(100, (client.points / firstReward.points_requis) * 100) : 100
  const qrValue = `${window.location.origin}/ma-carte`
  const prenom = client.nom_complet?.split(' ')[0] || client.nom_complet

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.shopRow}>
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
        <div className={styles.ptsBig}>{client.points}</div>
        <div className={styles.ptsLabel}>points</div>
        <div className={styles.barBg}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.ptsNext}>
          {firstReward
            ? `Encore ${firstReward.points_requis - client.points} pts → ${firstReward.nom}`
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
                  <button className={client.points >= r.points_requis ? styles.rewBtnOk : styles.rewBtnNo}>
                    {client.points >= r.points_requis ? 'Disponible' : `${r.points_requis} pts`}
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
