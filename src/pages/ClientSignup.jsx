import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import styles from './ClientSignup.module.css'

export default function ClientSignup() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [commercant, setCommercant] = useState(null)
  const [step, setStep] = useState(1) // 1 = inscription, 2 = bienvenue
  const [form, setForm] = useState({ name: '', email: '', tel: '', accept: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const [clientData, setClientData] = useState(null)
  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => { loadCommercant() }, [slug])

  async function loadCommercant() {
    setLoadingPage(true)
    const { data } = slug
      ? await supabase.from('commercants').select('*').eq('slug', slug).single()
      : await supabase.from('commercants').select('*').limit(1).single()
    setCommercant(data)
    setLoadingPage(false)
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Veuillez renseigner votre nom et votre email.')
      return
    }
    setLoading(true)
    setError('')
    try {
      // Vérifie si déjà inscrit
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('commercant_id', commercant.id)
        .eq('email', form.email.trim())
        .maybeSingle()

      if (existing) {
        setError('Vous êtes déjà inscrit à ce programme avec cet email.')
        setLoading(false)
        return
      }

      const { data, error: err } = await supabase
        .from('clients')
        .insert({
          commercant_id: commercant.id,
          nom_complet: form.name.trim(),
          email: form.email.trim(),
          telephone: form.tel.trim(),
          points: commercant.bonus_bienvenue || 0,
          notifications_acceptees: form.accept,
        })
        .select()
        .single()

      if (err) throw err

      if (commercant.bonus_bienvenue > 0) {
        await supabase.from('transactions').insert({
          client_id: data.id,
          commercant_id: commercant.id,
          points: commercant.bonus_bienvenue,
          type: 'bonus_bienvenue',
          description: 'Bonus de bienvenue',
        })
      }

      setClientData(data)
      sessionStorage.setItem('client_data', JSON.stringify(data))
      sessionStorage.setItem('commercant_data', JSON.stringify(commercant))
      setStep(2)
    } catch (e) {
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingPage) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#94A3B8', fontSize: 14 }}>
      Chargement...
    </div>
  )

  if (!commercant) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', flexDirection: 'column', gap: 12, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Programme introuvable</div>
      <div style={{ fontSize: 14, color: '#64748B' }}>Ce lien ne correspond à aucun commerce.</div>
    </div>
  )

  // ÉTAPE 2 — BIENVENUE APRÈS INSCRIPTION
  if (step === 2 && clientData) return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: '#F8FAFF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ background: '#2563EB', padding: '40px 24px 32px', color: '#fff', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
          🎉
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Bienvenue {clientData.nom_complet?.split(' ')[0]} !</h2>
        <p style={{ fontSize: 14, opacity: .85 }}>Vous êtes inscrit au programme de fidélité de {commercant.nom_commerce}</p>
      </div>

      <div style={{ padding: '24px 20px' }}>

        {/* POINTS OFFERTS */}
        {commercant.bonus_bienvenue > 0 && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#DCFCE7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⭐</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>{commercant.bonus_bienvenue} points offerts !</div>
              <div style={{ fontSize: 12, color: '#166534' }}>Cadeau de bienvenue sur votre compte</div>
            </div>
          </div>
        )}

        {/* COMMENT ÇA MARCHE */}
        <div style={{ background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Comment ça marche ?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { n: '1', t: 'Faites vos achats', d: 'À chaque visite chez ' + commercant.nom_commerce + ', vous gagnez des points sur vos achats.' },
              { n: '2', t: 'Montrez votre QR code', d: 'Le commerçant scanne votre QR code pour créditer vos points automatiquement.' },
              { n: '3', t: 'Échangez vos récompenses', d: 'Dès que vous avez assez de points, réclamez votre récompense !' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/ma-carte')}
          style={{ width: '100%', background: '#2563EB', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, padding: 14, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Voir ma carte de fidélité →
        </button>

        <p style={{ fontSize: 12, color: '#CBD5E1', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
          Programme géré par FidèleApp · Données protégées RGPD
        </p>
      </div>
    </div>
  )

  // ÉTAPE 1 — INSCRIPTION
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.shopLogo}>{commercant.nom_commerce?.[0]?.toUpperCase()}</div>
        <h2 className={styles.shopName}>{commercant.nom_commerce}</h2>
        <p className={styles.shopSub}>Rejoignez le programme de fidélité et gagnez des points à chaque visite</p>
      </div>

      <div className={styles.body}>
        {commercant.bonus_bienvenue > 0 && (
          <div className={styles.bonusBanner}>
            {commercant.bonus_bienvenue} points offerts dès votre inscription !
          </div>
        )}

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#DC2626', fontWeight: 600, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div className={styles.field}>
          <label>Prénom et nom</label>
          <input type="text" placeholder="Marie Dupont" value={form.name} onChange={e => handle('name', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Email</label>
          <input type="email" placeholder="marie@email.fr" value={form.email} onChange={e => handle('email', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Téléphone (optionnel)</label>
          <input type="tel" placeholder="06 12 34 56 78" value={form.tel} onChange={e => handle('tel', e.target.value)} />
        </div>

        <div className={styles.checkRow}>
          <input type="checkbox" id="accept" checked={form.accept} onChange={e => handle('accept', e.target.checked)} />
          <label htmlFor="accept">J'accepte de recevoir des notifications de {commercant.nom_commerce}.</label>
        </div>

        <button className={styles.btnBlue} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Inscription...' : 'Créer mon compte fidélité →'}
        </button>

        <p className={styles.legal}>Programme géré par FidèleApp · Données protégées conformément au RGPD</p>
      </div>
    </div>
  )
}
