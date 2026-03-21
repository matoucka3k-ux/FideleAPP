import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import styles from './MonCompte.module.css'

const TABS = ['Profil', 'Abonnement', 'Sécurité', 'Mentions légales & RGPD']
const LEGAL_TABS = ['CGU', 'Confidentialité', 'RGPD', 'Mentions légales', 'Cookies']

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
  }, [commercant, editing])

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

  const cancelEditing = () => {
    setEditing(false)
    setForm(null)
  }

  const saveProfile = async () => {
    if (!form) return
    try {
      await updateCommercant({
        nom_complet: `${form.prenom} ${form.nom}`.trim(),
        nom_commerce: form.nom_commerce,
        telephone: form.telephone,
        adresse: form.adresse,
      })
      setEditing(false)
      setForm(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('Erreur lors de la sauvegarde : ' + (e?.message || 'Erreur inconnue'))
    }
  }

  // ── Loading ──────────────────────────────────────────
  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingText}>Chargement...</div>
    </div>
  )

  // ── Pas de commerçant ────────────────────────────────
  if (!commercant) return (
    <div className={styles.errorPage}>
      <div className={styles.errorTitle}>Impossible de charger le compte</div>
      <div className={styles.errorText}>
        Vérifiez votre connexion ou reconnectez-vous.<br />
        <span className={styles.errorLink} onClick={signOut}>Se déconnecter</span>
      </div>
    </div>
  )

  // ── Données dérivées (calculées après les early returns) ──
  const initiales = (commercant.nom_complet || '')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  const displayFields = [
    { label: 'Prénom', value: commercant.nom_complet?.split(' ')[0] ?? '', full: false },
    { label: 'Nom', value: commercant.nom_complet?.split(' ').slice(1).join(' ') ?? '', full: false },
    { label: 'Nom du commerce', value: commercant.nom_commerce ?? '', full: true },
    { label: 'Email', value: commercant.email ?? '', full: false },
    { label: 'Téléphone', value: commercant.telephone ?? '', full: false },
    { label: 'Adresse', value: commercant.adresse ?? '', full: true },
  ]

  const editFields = [
    { label: 'Prénom', key: 'prenom', full: false, disabled: false },
    { label: 'Nom', key: 'nom', full: false, disabled: false },
    { label: 'Nom du commerce', key: 'nom_commerce', full: true, disabled: false },
    { label: 'Email', key: 'email', full: false, disabled: true },
    { label: 'Téléphone', key: 'telephone', full: false, disabled: false },
    { label: 'Adresse', key: 'adresse', full: true, disabled: false },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.title}>Mon compte</div>
        <div className={styles.sub}>Gérez vos informations, votre abonnement et vos préférences</div>
      </div>

      <div className={styles.content}>
        {saved && (
          <div className={styles.successBanner}>✓ Modifications enregistrées</div>
        )}

        {/* ── Onglets principaux ─────────────────────── */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t}
              className={tab === t ? styles.tabActive : styles.tab}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── PROFIL ─────────────────────────────────── */}
        {tab === 'Profil' && (
          <div className={styles.card}>
            <div className={styles.profileHeader}>
              <div className={styles.cardTitle}>Informations du commerce</div>
              {editing ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={styles.btnEdit} onClick={cancelEditing}>Annuler</button>
                  <button className={styles.btnSave} onClick={saveProfile}>Enregistrer</button>
                </div>
              ) : (
                <button className={styles.btnEdit} onClick={startEditing}>Modifier</button>
              )}
            </div>

            <div className={styles.profileRow}>
              <div className={styles.avatar}>{initiales}</div>
              <div>
                <div className={styles.profileName}>{commercant.nom_complet || 'Mon commerce'}</div>
                <div className={styles.profileEmail}>{commercant.email || ''}</div>
              </div>
            </div>

            <div className={styles.formGrid}>
              {editing && form ? (
                editFields.map(f => (
                  <div key={f.label} className={f.full ? styles.fieldFull : undefined} style={{ display: 'flex', flexDirection: 'column' }}>
                    <label className={styles.fieldLabel}>{f.label}</label>
                    <input
                      className={styles.fieldInput}
                      value={form[f.key] || ''}
                      disabled={f.disabled}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  </div>
                ))
              ) : (
                displayFields.map(f => (
                  <div key={f.label} className={f.full ? styles.fieldFull : undefined} style={{ display: 'flex', flexDirection: 'column' }}>
                    <label className={styles.fieldLabel}>{f.label}</label>
                    <input className={styles.fieldInput} defaultValue={f.value} disabled />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── ABONNEMENT ─────────────────────────────── */}
        {tab === 'Abonnement' && (
          <>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Mon abonnement actuel</div>
              <div className={styles.betaCard}>
                <div>
                  <div className={styles.betaBadge}>Accès bêta</div>
                  <div className={styles.betaTitle}>Version bêta — Accès gratuit</div>
                  <div className={styles.betaSub}>Accès complet offert pendant la période de test</div>
                  <div className={styles.betaNote}>La tarification sera communiquée avant la sortie officielle</div>
                </div>
                <div className={styles.betaFeatures}>
                  {['Clients illimités', 'Récompenses illimitées', "QR Code d'inscription"].map(f => (
                    <div key={f} className={styles.betaFeature}>
                      <span className={styles.betaCheck}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.infoBox}>
              <div className={styles.infoBoxTitle}>Vous êtes bêta-testeur</div>
              <div className={styles.infoBoxText}>
                Merci de nous faire confiance. Votre retour est précieux pour améliorer FidèleApp avant son lancement officiel. En cas de question, contactez-nous à <strong>contact@fidele-app.fr</strong>
              </div>
            </div>
          </>
        )}

        {/* ── SÉCURITÉ ───────────────────────────────── */}
        {tab === 'Sécurité' && (
          <>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Sécurité du compte</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 8, marginBottom: 4 }}>
                Pour modifier votre mot de passe, contactez-nous à <span style={{ color: '#2563EB', fontWeight: 600 }}>contact@fidele-app.fr</span>
              </div>
            </div>
            <div className={styles.logoutZone}>
              <div>
                <div className={styles.logoutTitle}>Se déconnecter</div>
                <div className={styles.logoutSub}>Vous serez redirigé vers la page de connexion</div>
              </div>
              <button className={styles.btnLogout} onClick={signOut}>
                Se déconnecter
              </button>
            </div>
          </>
        )}

        {/* ── MENTIONS LÉGALES & RGPD ────────────────── */}
        {tab === 'Mentions légales & RGPD' && (
          <div className={styles.card}>
            <div className={styles.legalTabs}>
              {LEGAL_TABS.map(t => (
                <button
                  key={t}
                  className={legalTab === t ? styles.legalTabActive : styles.legalTab}
                  onClick={() => setLegalTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {legalTab === 'CGU' && (
              <div>
                <h2 className={styles.legalH2}>Conditions Générales d'Utilisation</h2>
                <p className={styles.legalDate}>Dernière mise à jour : 1er janvier 2025</p>
                <h3 className={styles.legalH3}>1. Objet</h3>
                <p className={styles.legalP}>Les présentes CGU régissent l'accès et l'utilisation de la plateforme FidèleApp. FidèleApp est actuellement en version bêta — les CGU définitives seront publiées avant le lancement officiel.</p>
                <h3 className={styles.legalH3}>2. Accès au service</h3>
                <p className={styles.legalP}>FidèleApp est accessible à tout commerçant disposant d'un établissement en France. L'accès bêta est gratuit et sans engagement.</p>
                <h3 className={styles.legalH3}>3. Évolution du service</h3>
                <p className={styles.legalPLast}>En tant que bêta-testeur, vous serez informé de toute évolution tarifaire ou contractuelle avant son entrée en vigueur. Vous pouvez supprimer votre compte à tout moment en contactant contact@fidele-app.fr.</p>
              </div>
            )}

            {legalTab === 'Confidentialité' && (
              <div>
                <h2 className={styles.legalH2}>Politique de confidentialité</h2>
                <p className={styles.legalDate}>Dernière mise à jour : 1er janvier 2025</p>
                <h3 className={styles.legalH3}>Données collectées</h3>
                <p className={styles.legalP}>FidèleApp collecte : nom, prénom, email, téléphone et adresse du commerce. Ces données sont collectées lors de la création du compte et de l'utilisation du service.</p>
                <h3 className={styles.legalH3}>Utilisation des données</h3>
                <p className={styles.legalPLast}>Vos données sont utilisées exclusivement pour la gestion de votre compte et le support client. Vos données ne sont jamais vendues à des tiers.</p>
              </div>
            )}

            {legalTab === 'RGPD' && (
              <div>
                <h2 className={styles.legalH2}>Vos droits RGPD</h2>
                <div className={styles.rgpdBadge}>✓ FidèleApp est conforme au RGPD</div>
                {[
                  ['D', "Droit d'accès", 'Obtenir une copie de vos données personnelles détenues par FidèleApp'],
                  ['R', 'Droit de rectification', 'Corriger vos données inexactes ou incomplètes'],
                  ['E', "Droit à l'effacement", "Demander la suppression de vos données (droit à l'oubli)"],
                  ['P', 'Droit à la portabilité', 'Recevoir vos données dans un format structuré et lisible'],
                  ['O', "Droit d'opposition", 'Vous opposer au traitement de vos données à des fins de prospection']
                ].map(([letter, title, desc]) => (
                  <div key={letter} className={styles.rgpdRow}>
                    <span className={styles.rgpdIcon}>{letter}</span>
                    <div className={styles.rgpdText}>
                      <strong className={styles.rgpdTextBold}>{title}</strong> — {desc}
                    </div>
                  </div>
                ))}
                <p className={styles.legalP} style={{ marginTop: 12 }}>
                  Pour exercer vos droits : <span style={{ color: '#2563EB', fontWeight: 600 }}>contact@fidele-app.fr</span>
                </p>
              </div>
            )}

            {legalTab === 'Mentions légales' && (
              <div>
                <h2 className={styles.legalH2} style={{ marginBottom: 16 }}>Mentions légales</h2>
                <h3 className={styles.legalH3}>Éditeur</h3>
                <p className={styles.legalP}>FidèleApp — Version bêta<br />contact@fidele-app.fr</p>
                <h3 className={styles.legalH3}>Hébergement</h3>
                <p className={styles.legalPLast}>Supabase Inc. (États-Unis) pour la base de données. Les mentions légales complètes seront publiées lors du lancement officiel.</p>
              </div>
            )}

            {legalTab === 'Cookies' && (
              <div>
                <h2 className={styles.legalH2} style={{ marginBottom: 16 }}>Politique de cookies</h2>
                <h3 className={styles.legalH3}>Cookies essentiels</h3>
                <p className={styles.legalP}>Nécessaires au fonctionnement du service. Ne peuvent pas être désactivés.</p>
                <h3 className={styles.legalH3}>Cookies analytiques</h3>
                <p className={styles.legalP}>Nous utilisons des cookies analytiques anonymisés pour améliorer le service. Vous pouvez les désactiver.</p>
                <div className={styles.cookieRow}>
                  <div>
                    <div className={styles.cookieLabel}>Cookies analytiques</div>
                    <div className={styles.cookieSub}>Mesure d'audience anonymisée</div>
                  </div>
                  <button
                    className={cookieOn ? styles.toggleOn : styles.toggleOff}
                    onClick={() => setCookieOn(v => !v)}
                  >
                    <span className={styles.toggleDot} style={{ left: cookieOn ? 21 : 3 }} />
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




