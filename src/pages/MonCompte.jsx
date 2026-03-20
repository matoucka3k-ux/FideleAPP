import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'

const TABS = ['Profil', 'Abonnement', 'Sécurité', 'Mentions légales & RGPD']
const LEGAL_TABS = ['CGU', 'Confidentialité', 'RGPD', 'Mentions légales', 'Cookies']

const s = {
  page: { minHeight: '100vh', background: '#F8FAFF' },
  topbar: { background: '#fff', borderBottom: '1px solid #E8F0FE', padding: '14px 28px' },
  title: { fontSize: 18, fontWeight: 800, color: '#0F172A' },
  sub: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  content: { padding: '24px 28px', maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 20 },
  card: { background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: '22px 24px' },
  cardTitle: { fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#64748B', marginBottom: 16 },
}

export default function MonCompte() {
  const { commercant, loading, signOut, updateCommercant } = useAuth()
  const [tab, setTab] = useState('Profil')
  const [legalTab, setLegalTab] = useState('CGU')
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cookieOn, setCookieOn] = useState(true)
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (commercant && editing) {
      setForm({
        prenom: commercant?.nom_complet?.split(' ')[0] ?? '',
        nom: commercant?.nom_complet?.split(' ').slice(1).join(' ') ?? '',
        nom_commerce: commercant?.nom_commerce ?? '',
        email: commercant?.email ?? '',
        telephone: commercant?.telephone ?? '',
        adresse: commercant?.adresse ?? '',
      })
    }
  }, [commercant])

  const startEditing = () => {
    setForm({
      prenom: commercant?.nom_complet?.split(' ')[0] ?? '',
      nom: commercant?.nom_complet?.split(' ').slice(1).join(' ') ?? '',
      nom_commerce: commercant?.nom_commerce ?? '',
      email: commercant?.email ?? '',
      telephone: commercant?.telephone ?? '',
      adresse: commercant?.adresse ?? '',
    })
    setEditing(true)
  }

  const saveProfile = async () => {
    try {
      await updateCommercant({
        nom_complet: `${form.prenom} ${form.nom}`.trim(),
        nom_commerce: form.nom_commerce,
        telephone: form.telephone,
        adresse: form.adresse,
      })
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('Erreur lors de la sauvegarde : ' + e.message)
    }
  }

  const initiales = commercant?.nom_complet?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  const tabStyle = (t) => ({
    padding: '8px 18px', borderRadius: 8, border: tab === t ? '1px solid #E8F0FE' : 'none',
    background: tab === t ? '#fff' : 'none', color: tab === t ? '#2563EB' : '#64748B',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s'
  })

  const lTabStyle = (t) => ({
    padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${legalTab === t ? '#93C5FD' : '#E2E8F0'}`,
    background: legalTab === t ? '#EFF6FF' : '#fff', color: legalTab === t ? '#2563EB' : '#475569',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
  })

  const inp = (disabled) => ({
    border: `1.5px solid ${disabled ? '#F1F5F9' : '#E2E8F0'}`, borderRadius: 8, padding: '9px 12px',
    fontSize: 14, fontFamily: 'inherit', color: '#0F172A', outline: 'none',
    background: disabled ? '#F8FAFF' : '#fff', width: '100%'
  })

  if (!commercant) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 14, color: '#94A3B8', fontWeight: 600 }}>Chargement...</div>
    </div>
  )

  const fields = editing && form ? [
    ['Prénom', 'prenom', false],
    ['Nom', 'nom', false],
    ['Nom du commerce', 'nom_commerce', true],
    ['Email', 'email', false, true],
    ['Téléphone', 'telephone', false, false],
    ['Adresse', 'adresse', true, false],
  ] : [
    ['Prénom', commercant?.nom_complet?.split(' ')[0] ?? '', false],
    ['Nom', commercant?.nom_complet?.split(' ').slice(1).join(' ') ?? '', false],
    ['Nom du commerce', commercant?.nom_commerce ?? '', true],
    ['Email', commercant?.email ?? '', false],
    ['Téléphone', commercant?.telephone ?? '', false],
    ['Adresse', commercant?.adresse ?? '', true],
  ]

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div style={s.title}>Mon compte</div>
        <div style={s.sub}>Gérez vos informations, votre abonnement et vos préférences</div>
      </div>
      <div style={s.content}>
        {saved && (
          <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: 9, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#166534' }}>
            ✓ Modifications enregistrées
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 10, padding: 3, width: 'fit-content' }}>
          {TABS.map(t => <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === 'Profil' && (
          <div style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={s.cardTitle}>Informations du commerce</div>
              <button
                onClick={() => editing ? saveProfile() : startEditing()}
                style={{ background: editing ? '#2563EB' : '#F8FAFF', color: editing ? '#fff' : '#475569', border: '1.5px solid #E2E8F0', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {editing ? 'Enregistrer' : 'Modifier'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2563EB', color: '#fff', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {initiales}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{commercant.nom_complet}</div>
                <div style={{ fontSize: 13, color: '#94A3B8' }}>{commercant.email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {editing && form ? (
                fields.map(([label, key, full, disabled]) => (
                  <div key={label} style={{ gridColumn: full ? '1/-1' : 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</label>
                    <input
                      value={form[key]}
                      disabled={disabled}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={inp(disabled)}
                    />
                  </div>
                ))
              ) : (
                fields.map(([label, value, full]) => (
                  <div key={label} style={{ gridColumn: full ? '1/-1' : 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</label>
                    <input defaultValue={value} disabled style={inp(true)} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'Abonnement' && (
          <>
            <div style={s.card}>
              <div style={s.cardTitle}>Mon abonnement actuel</div>
              <div style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border: '1.5px solid #93C5FD', borderRadius: 12, padding: '20px 22px', marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, display: 'inline-block', marginBottom: 8 }}>Accès bêta</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#1D4ED8', marginBottom: 4 }}>Version bêta — Accès gratuit</div>
                    <div style={{ fontSize: 14, color: '#3B82F6', fontWeight: 600 }}>Accès complet offert pendant la période de test</div>
                    <div style={{ fontSize: 12, color: '#60A5FA', marginTop: 2 }}>La tarification sera communiquée avant la sortie officielle</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 16 }}>
                  {['Clients illimités', 'Récompenses illimitées', "QR Code d'inscription"].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#1E40AF', fontWeight: 500 }}>
                      <span style={{ color: '#2563EB', fontWeight: 700 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1D4ED8', marginBottom: 4 }}>Vous êtes bêta-testeur</div>
              <div style={{ fontSize: 13, color: '#3B82F6', lineHeight: 1.65 }}>
                Merci de nous faire confiance. Votre retour est précieux pour améliorer FidèleApp avant son lancement officiel. En cas de question, contactez-nous à <span style={{ fontWeight: 700 }}>contact@fidele-app.fr</span>
              </div>
            </div>
          </>
        )}

        {tab === 'Sécurité' && (
          <>
            <div style={s.card}>
              <div style={s.cardTitle}>Sécurité du compte</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 8, marginBottom: 4 }}>
                Pour modifier votre mot de passe, contactez-nous à <span style={{ color: '#2563EB', fontWeight: 600 }}>contact@fidele-app.fr</span>
              </div>
            </div>
            <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#991B1B', marginBottom: 3 }}>Se déconnecter</div>
                <div style={{ fontSize: 13, color: '#B91C1C' }}>Vous serez redirigé vers la page de connexion</div>
              </div>
              <button onClick={signOut} style={{ background: '#DC2626', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                Se déconnecter
              </button>
            </div>
          </>
        )}

        {tab === 'Mentions légales & RGPD' && (
          <div style={s.card}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {LEGAL_TABS.map(t => <button key={t} style={lTabStyle(t)} onClick={() => setLegalTab(t)}>{t}</button>)}
            </div>

            {legalTab === 'CGU' && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Conditions Générales d'Utilisation</h2>
                <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Dernière mise à jour : 1er janvier 2025</p>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>1. Objet</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, marginBottom: 12 }}>Les présentes CGU régissent l'accès et l'utilisation de la plateforme FidèleApp. FidèleApp est actuellement en version bêta — les CGU définitives seront publiées avant le lancement officiel.</p>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>2. Accès au service</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, marginBottom: 12 }}>FidèleApp est accessible à tout commerçant disposant d'un établissement en France. L'accès bêta est gratuit et sans engagement.</p>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>3. Évolution du service</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75 }}>En tant que bêta-testeur, vous serez informé de toute évolution tarifaire ou contractuelle avant son entrée en vigueur. Vous pouvez supprimer votre compte à tout moment en contactant contact@fidele-app.fr.</p>
              </div>
            )}

            {legalTab === 'Confidentialité' && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Politique de confidentialité</h2>
                <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Dernière mise à jour : 1er janvier 2025</p>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Données collectées</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, marginBottom: 12 }}>FidèleApp collecte : nom, prénom, email, téléphone et adresse du commerce. Ces données sont collectées lors de la création du compte et de l'utilisation du service.</p>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Utilisation des données</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75 }}>Vos données sont utilisées exclusivement pour la gestion de votre compte et le support client. Vos données ne sont jamais vendues à des tiers.</p>
              </div>
            )}

            {legalTab === 'RGPD' && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Vos droits RGPD</h2>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#166534', padding: '3px 10px', marginBottom: 16 }}>✓ FidèleApp est conforme au RGPD</div>
                {[
                  ['D', "Droit d'accès", 'Obtenir une copie de vos données personnelles détenues par FidèleApp'],
                  ['R', 'Droit de rectification', 'Corriger vos données inexactes ou incomplètes'],
                  ['E', "Droit à l'effacement", "Demander la suppression de vos données (droit à l'oubli)"],
                  ['P', 'Droit à la portabilité', 'Recevoir vos données dans un format structuré et lisible'],
                  ['O', "Droit d'opposition", 'Vous opposer au traitement de vos données à des fins de prospection']
                ].map(([d, t, txt]) => (
                  <div key={d} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <span style={{ width: 20, height: 20, background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#2563EB', fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{d}</span>
                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.65 }}><strong style={{ color: '#0F172A' }}>{t}</strong> — {txt}</div>
                  </div>
                ))}
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, marginTop: 12 }}>Pour exercer vos droits : <span style={{ color: '#2563EB', fontWeight: 600 }}>contact@fidele-app.fr</span></p>
              </div>
            )}

            {legalTab === 'Mentions légales' && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Mentions légales</h2>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Éditeur</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, marginBottom: 12 }}>FidèleApp — Version bêta<br />contact@fidele-app.fr</p>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Hébergement</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75 }}>Supabase Inc. (États-Unis) pour la base de données. Les mentions légales complètes seront publiées lors du lancement officiel.</p>
              </div>
            )}

            {legalTab === 'Cookies' && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Politique de cookies</h2>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Cookies essentiels</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, marginBottom: 12 }}>Nécessaires au fonctionnement du service. Ne peuvent pas être désactivés.</p>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Cookies analytiques</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, marginBottom: 14 }}>Nous utilisons des cookies analytiques anonymisés pour améliorer le service. Vous pouvez les désactiver.</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFF', border: '1px solid #E8F0FE', borderRadius: 9, padding: '12px 16px' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Cookies analytiques</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Mesure d'audience anonymisée</div>
                  </div>
                  <button onClick={() => setCookieOn(v => !v)} style={{ width: 42, height: 24, background: cookieOn ? '#2563EB' : '#E2E8F0', borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                    <span style={{ position: 'absolute', top: 3, left: cookieOn ? 21 : 3, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'left .2s', display: 'block' }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

