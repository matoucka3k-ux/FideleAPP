import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import styles from './ClientSignup.module.css'

export default function ClientSignup() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [commercant, setCommercant] = useState(null)
  const [step, setStep] = useState('form') // form | welcome
  const [isNew, setIsNew] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', tel: '', accept: false, acceptMarketing: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const [clientData, setClientData] = useState(null)
  const [showLegal, setShowLegal] = useState(null)
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
    if (!form.accept) {
      setError('Vous devez accepter les conditions d\'utilisation.')
      return
    }
    setLoading(true)
    setError('')
    try {
      // Cherche si ce client existe déjà (même email, tous commerces confondus)
      const { data: existing } = await supabase
        .from('clients')
        .select('*')
        .eq('email', form.email.trim())
        .maybeSingle()

      let client = existing

      if (!existing) {
        // Nouveau client — on crée son compte
        const { data, error: err } = await supabase
          .from('clients')
          .insert({
            commercant_id: commercant.id,
            nom_complet: form.name.trim(),
            email: form.email.trim(),
            telephone: form.tel.trim(),
            points: 0,
            notifications_acceptees: form.acceptMarketing,
          })
          .select()
          .single()
        if (err) throw err
        client = data
        setIsNew(true)
      } else {
        setIsNew(false)
      }

      // Vérifie si déjà adhérent à ce commerce
      const { data: existingAdhesion } = await supabase
        .from('adhesions')
        .select('id')
        .eq('client_id', client.id)
        .eq('commercant_id', commercant.id)
        .maybeSingle()

      if (existingAdhesion) {
        setError('Vous êtes déjà inscrit au programme de ' + commercant.nom_commerce + '.')
        setLoading(false)
        return
      }

      // Crée l'adhésion à ce commerce
      await supabase.from('adhesions').insert({
        client_id: client.id,
        commercant_id: commercant.id,
        points: commercant.bonus_bienvenue || 0,
      })

      // Bonus bienvenue
      if (commercant.bonus_bienvenue > 0) {
        await supabase.from('transactions').insert({
          client_id: client.id,
          commercant_id: commercant.id,
          points: commercant.bonus_bienvenue,
          type: 'bonus_bienvenue',
          description: 'Bonus de bienvenue — ' + commercant.nom_commerce,
        })
      }

      setClientData(client)
      sessionStorage.setItem('client_data', JSON.stringify(client))
      sessionStorage.setItem('commercant_data', JSON.stringify(commercant))
      setStep('welcome')
    } catch (e) {
      console.error(e)
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

  // MODAL LÉGAL
  if (showLegal) return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ background: '#2563EB', padding: '20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setShowLegal(null)} style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>←</button>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
          {showLegal === 'cgu' && 'Conditions d\'utilisation'}
          {showLegal === 'confidentialite' && 'Politique de confidentialité'}
          {showLegal === 'rgpd' && 'Vos droits RGPD'}
        </div>
      </div>
      <div style={{ padding: '24px 20px' }}>
        {showLegal === 'cgu' && (
          <>
            <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>Dernière mise à jour : 1er janvier 2025</p>
            {[
              ['1. Objet', 'En rejoignant ce programme, vous acceptez les présentes conditions. Le programme est géré par FidèleApp SAS pour le compte de ' + commercant.nom_commerce + '.'],
              ['2. Inscription', 'L\'inscription est gratuite et ouverte à toute personne majeure. Vous vous engagez à fournir des informations exactes.'],
              ['3. Points', 'Les points sont crédités à chaque achat selon les règles du commerçant. Ils n\'ont aucune valeur monétaire et ne peuvent pas être échangés contre de l\'argent.'],
              ['4. Récompenses', 'Les récompenses sont échangeables selon les conditions du commerçant, qui peut les modifier à tout moment.'],
              ['5. Multi-commerces', 'Votre compte FidèleApp vous permet de rejoindre plusieurs programmes. Les points sont propres à chaque commerce.'],
              ['6. Résiliation', 'Vous pouvez demander la suppression de votre compte à tout moment via rgpd@fidele-app.fr.'],
            ].map(([t, c]) => (
              <div key={t} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{c}</div>
              </div>
            ))}
          </>
        )}
        {showLegal === 'confidentialite' && (
          <>
            <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>Dernière mise à jour : 1er janvier 2025</p>
            {[
              ['Données collectées', 'Nom, email, téléphone (optionnel). Nécessaires pour gérer votre compte de fidélité.'],
              ['Utilisation', 'Uniquement pour gérer votre programme, vous envoyer des notifications si consentement, et améliorer le service.'],
              ['Partage', 'Partagées uniquement avec les commerçants dont vous êtes membre. Jamais vendues à des tiers.'],
              ['Conservation', 'Conservées pendant votre adhésion et supprimées sous 30 jours après désinscription.'],
              ['Hébergement', 'Serveurs en Europe (France / Allemagne), conformes au RGPD.'],
            ].map(([t, c]) => (
              <div key={t} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{c}</div>
              </div>
            ))}
          </>
        )}
        {showLegal === 'rgpd' && (
          <>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#166534', fontWeight: 600, marginBottom: 20 }}>
              ✓ FidèleApp est conforme au RGPD (Règlement EU 2016/679)
            </div>
            {[
              ['Droit d\'accès', 'Obtenir une copie de vos données.'],
              ['Droit de rectification', 'Corriger vos données inexactes.'],
              ['Droit à l\'effacement', 'Demander la suppression de vos données.'],
              ['Droit à la portabilité', 'Recevoir vos données dans un format lisible.'],
              ['Droit d\'opposition', 'Vous opposer au traitement marketing.'],
              ['Droit de retrait', 'Retirer votre consentement à tout moment.'],
            ].map(([t, c]) => (
              <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 20, height: 20, background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#2563EB', fontWeight: 800, flexShrink: 0, marginTop: 2 }}>✓</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{t}</div>
                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{c}</div>
                </div>
              </div>
            ))}
            <div style={{ background: '#F8FAFF', border: '1px solid #E8F0FE', borderRadius: 9, padding: '12px 14px', marginTop: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Exercer vos droits</div>
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                Email : <span style={{ color: '#2563EB', fontWeight: 600 }}>rgpd@fidele-app.fr</span><br />
                Réponse sous 30 jours · Vous pouvez aussi saisir la <span style={{ color: '#2563EB', fontWeight: 600 }}>CNIL (cnil.fr)</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  // BIENVENUE
  if (step === 'welcome' && clientData) return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: '#F8FAFF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ background: '#2563EB', padding: '48px 24px 32px', color: '#fff', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
          {isNew ? '🎉' : '👋'}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -.5 }}>
          {isNew ? `Bienvenue ${clientData.nom_complet?.split(' ')[0]} !` : `Content de vous revoir !`}
        </h2>
        <p style={{ fontSize: 14, opacity: .85, lineHeight: 1.6 }}>
          {isNew ? 'Votre compte FidèleApp est créé.' : 'Nouveau commerce ajouté à votre compte.'}<br />
          <strong>{commercant.nom_commerce}</strong> vous a rejoint !
        </p>
      </div>

      <div style={{ padding: '24px 20px' }}>
        {commercant.bonus_bienvenue > 0 && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 22, flexShrink: 0 }}>⭐</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#16A34A' }}>{commercant.bonus_bienvenue} points offerts !</div>
              <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>Déjà crédités chez {commercant.nom_commerce}</div>
            </div>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: '18px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Comment ça marche</div>
          {[
            ['1', 'Achetez', 'Faites vos achats chez ' + commercant.nom_commerce + ' et gagnez des points.'],
            ['2', 'Montrez votre QR', 'Le commerçant scanne votre QR code pour créditer vos points.'],
            ['3', 'Échangez', 'Utilisez vos points pour obtenir des récompenses.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{t}</div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/ma-carte')} style={{ width: '100%', background: '#2563EB', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, padding: 14, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>
          Voir mon espace fidélité →
        </button>

        <p style={{ fontSize: 11, color: '#CBD5E1', textAlign: 'center', lineHeight: 1.7 }}>
          <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => setShowLegal('rgpd')}>RGPD</span> ·{' '}
          <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => setShowLegal('confidentialite')}>Confidentialité</span> ·{' '}
          <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => setShowLegal('cgu')}>CGU</span>
        </p>
      </div>
    </div>
  )

  // FORMULAIRE
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.shopLogo}>{commercant.nom_commerce?.[0]?.toUpperCase()}</div>
        <h2 className={styles.shopName}>{commercant.nom_commerce}</h2>
        <p className={styles.shopSub}>Rejoignez le programme de fidélité et gagnez des points à chaque visite</p>
      </div>
      <div className={styles.body}>
        {commercant.bonus_bienvenue > 0 && (
          <div className={styles.bonusBanner}>{commercant.bonus_bienvenue} points offerts dès votre inscription !</div>
        )}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#DC2626', fontWeight: 600, marginBottom: 14 }}>{error}</div>
        )}
        <div className={styles.field}><label>Prénom et nom *</label><input type="text" placeholder="Marie Dupont" value={form.name} onChange={e => handle('name', e.target.value)} /></div>
        <div className={styles.field}><label>Email *</label><input type="email" placeholder="marie@email.fr" value={form.email} onChange={e => handle('email', e.target.value)} /></div>
        <div className={styles.field}><label>Téléphone (optionnel)</label><input type="tel" placeholder="06 12 34 56 78" value={form.tel} onChange={e => handle('tel', e.target.value)} /></div>
        <div style={{ height: 1, background: '#F1F5F9', margin: '16px 0' }} />
        <div className={styles.checkRow}>
          <input type="checkbox" id="accept" checked={form.accept} onChange={e => handle('accept', e.target.checked)} />
          <label htmlFor="accept">J'accepte les <span style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowLegal('cgu')}>conditions d'utilisation</span> et la <span style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowLegal('confidentialite')}>politique de confidentialité</span>. *</label>
        </div>
        <div className={styles.checkRow}>
          <input type="checkbox" id="marketing" checked={form.acceptMarketing} onChange={e => handle('acceptMarketing', e.target.checked)} />
          <label htmlFor="marketing">J'accepte de recevoir des offres et notifications de {commercant.nom_commerce}. (optionnel)</label>
        </div>
        <button className={styles.btnBlue} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Inscription...' : 'Créer mon compte fidélité →'}
        </button>
        <p style={{ fontSize: 11, color: '#CBD5E1', textAlign: 'center', marginTop: 14, lineHeight: 1.7 }}>
          Données protégées RGPD ·{' '}
          <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => setShowLegal('rgpd')}>Vos droits</span><br />
          FidèleApp SAS · contact@fidele-app.fr
        </p>
      </div>
    </div>
  )
}
