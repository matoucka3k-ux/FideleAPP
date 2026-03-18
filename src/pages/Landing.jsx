import { useNavigate } from 'react-router-dom'
import styles from './Landing.module.css'

const FEATURES = [
  { icon: '📱', name: 'Carte de fidélité digitale', desc: 'Vos clients ont leur carte sur leur téléphone. Fini les cartons perdus.', pill: 'Zéro papier' },
  { icon: '🔔', name: 'Notifications automatiques', desc: 'SMS ou push : anniversaire, points expirés, offre spéciale. On envoie, vous encaissez.', pill: 'Automatique' },
  { icon: '🎁', name: 'Récompenses sur mesure', desc: 'Café, remise, produit offert. Adapté à votre commerce, vous choisissez tout.', pill: 'Personnalisable' },
  { icon: '📊', name: 'Statistiques simples', desc: 'Combien de clients actifs, qui revient, qui s\'en va. Tableau de bord clair, sans jargon.', pill: 'Temps réel' },
  { icon: '📲', name: 'QR Code sur comptoir', desc: 'Un QR code à poser sur votre caisse. Inscription en 30 secondes pour vos clients.', pill: 'Plug & play' },
  { icon: '⭐', name: 'Offre d\'anniversaire', desc: 'FidèleApp envoie automatiquement une récompense le jour d\'anniversaire de vos clients.', pill: 'Fidélise ×2' },
]

const TESTIMONIALS = [
  { type: 'Boulangerie', quote: '"En 3 mois, 180 clients inscrits et mes ventes du matin ont augmenté de 30 %. Les gens viennent exprès pour cumuler leurs points."', name: 'Pierre Martin', role: 'Boulangerie Martin, Lyon', ini: 'PM' },
  { type: 'Coiffeur', quote: '"Avant je perdais des clients sans savoir pourquoi. Maintenant je les relance automatiquement. J\'en ai récupéré que je croyais perdus."', name: 'Sophie Bernard', role: 'Salon L\'Atelier, Bordeaux', ini: 'SB' },
  { type: 'Restaurant', quote: '"Super simple à mettre en place. En 10 minutes c\'était prêt. Mes habitués adorent et ils en parlent autour d\'eux."', name: 'Karim Nasser', role: 'Pizzeria Da Marco, Marseille', ini: 'KN' },
]

const DASH_METRICS = [
  { label: 'Clients fidèles', value: '248', change: '+12 ce mois' },
  { label: 'Achats enregistrés', value: '1 043', change: '+18%' },
  { label: 'Points distribués', value: '14 200', change: '+9%' },
  { label: 'Récompenses offertes', value: '37', change: 'ce mois' },
]

const DASH_CLIENTS = [
  { ini: 'AM', name: 'Alice M.', desc: 'Menu du jour ×2', pts: '+92 pts', type: 'Achat', typeColor: '#22c55e', ptColor: '#16a34a' },
  { ini: 'LB', name: 'Louise B.', desc: 'Bonus de bienvenue', pts: '+50 pts', type: 'bonus_bienvenue', typeColor: '#6366f1', ptColor: '#4f46e5' },
  { ini: 'FB', name: 'Florian B.', desc: 'Café offert', pts: '-100 pts', type: 'Échange', typeColor: '#f59e0b', ptColor: '#ef4444' },
  { ini: 'DM', name: 'David M.', desc: 'Kebab avec menu ×3', pts: '+74 pts', type: 'Achat', typeColor: '#22c55e', ptColor: '#16a34a' },
]

const BAR_DATA = [40, 52, 44, 63, 55, 75, 66, 82, 71, 90, 80, 100]

const IconDashboard = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:13,height:13}}>
    <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
    <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
  </svg>
)
const IconEncaisser = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:13,height:13}}>
    <rect x="1" y="8" width="6" height="7" rx="1"/><rect x="9" y="5" width="6" height="10" rx="1"/><rect x="1" y="1" width="6" height="5" rx="1"/>
  </svg>
)
const IconClients = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:13,height:13}}>
    <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
  </svg>
)
const IconPoints = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:13,height:13}}>
    <path d="M8 2l1.2 2.5 2.8.4-2 2 .5 2.8L8 8.4 5.5 9.7 6 6.9 4 4.9l2.8-.4z"/>
  </svg>
)
const IconCompte = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:13,height:13}}>
    <circle cx="8" cy="6" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/>
  </svg>
)

const NAV_ITEMS = [
  { label: 'Tableau de bord', icon: <IconDashboard />, active: true },
  { label: 'Encaisser', icon: <IconEncaisser />, active: false },
  { label: 'Mes clients', icon: <IconClients />, active: false },
  { label: 'Système de points', icon: <IconPoints />, active: false },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>
              <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2"><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
            </div>
            FidèleApp
          </div>
          <div className={styles.navLinks}>
            <a href="#features">Fonctionnalités</a>
            <a href="#pricing">Tarifs</a>
            <a href="#testi">Témoignages</a>
          </div>
          <div className={styles.navActions}>
            <button className={styles.btnGhost} onClick={() => navigate('/connexion')}>Connexion</button>
            <button className={styles.btnBlue} onClick={() => navigate('/inscription')}>Créer mon programme</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={`${styles.heroLeft} fade-up`}>
              <div className={styles.badge}><span className={styles.badgeDot} />Conçu pour les commerçants français</div>
              <h1 className={styles.heroTitle}>Vos clients reviennent.<br /><span>Pas par hasard.</span></h1>
              <p className={styles.heroSub}>FidèleApp crée votre programme de fidélité en 5 minutes. Cartes de points, récompenses, notifications — vos clients ont une vraie raison de revenir chez vous.</p>
              <div className={styles.heroCtas}>
                <button className={styles.btnBlueLg} onClick={() => navigate('/inscription')}>Créer mon programme →</button>
                <button className={styles.btnOutline}>Voir un exemple</button>
              </div>
              <p className={styles.heroNote}>Sans engagement · Sans matériel · Sans technicien</p>
            </div>
            <div className={`${styles.heroRight} fade-up-1`}>
              <div className={styles.phoneCard}>
                <div className={styles.phoneTop}>
                  <div className={styles.shopLogo}>BM</div>
                  <div>
                    <div className={styles.shopName}>Boulangerie Martin</div>
                    <div className={styles.shopType}>Programme de fidélité</div>
                  </div>
                </div>
                <div className={styles.cardFidel}>
                  <div className={styles.cardLabel}>Vos points</div>
                  <div className={styles.cardPts}>620</div>
                  <div className={styles.cardPtsLabel}>points cumulés</div>
                  <div className={styles.barBg}><div className={styles.barFill} style={{ width: '62%' }} /></div>
                  <div className={styles.cardNext}>Encore 380 pts pour obtenir un croissant offert</div>
                </div>
                <div className={styles.rewardsRow}>
                  {[['Café offert', '200 pts'], ['Viennoiserie', '1 000 pts'], ['Surprise', '2 000 pts']].map(([n, p]) => (
                    <div key={n} className={styles.reward}>
                      <div className={styles.rewardName}>{n}</div>
                      <div className={styles.rewardPts}>{p}</div>
                    </div>
                  ))}
                </div>
                <div className={styles.notif}>
                  <div className={styles.notifDot} />
                  <span><strong>+50 points</strong> crédités pour votre achat d'aujourd'hui</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGOS */}
      <div className={styles.logosBand}>
        <div className="container">
          <div className={styles.logosInner}>
            <span className={styles.logosLabel}>Idéal pour</span>
            {['Boulangeries', 'Coiffeurs', 'Restaurants', 'Instituts beauté', 'Boutiques mode', 'Épiceries bio'].map(l => (
              <span key={l} className={styles.logoType}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* DASHBOARD PREVIEW */}
      <section className={styles.preview}>
        <div className="container">
          <div className={styles.sectionLabel}>Aperçu du tableau de bord</div>
          <h2 className={styles.sectionTitle}>Tout ce qu'il se passe <span>dans votre commerce</span></h2>
          <p className={styles.sectionSub}>Simple et clair — pensé pour les commerçants, pas pour les informaticiens.</p>

          <div style={{
            background: '#fff', borderRadius: 16,
            boxShadow: '0 32px 80px rgba(0,0,0,0.13)',
            overflow: 'hidden', border: '1px solid #e8edf2',
            maxWidth: 900, margin: '0 auto',
          }}>
            {/* Barre macOS */}
            <div style={{
              background: '#f4f5f7', borderBottom: '1px solid #e2e6ea',
              padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#FF5F57', border: '1px solid #e0443e' }} />
              <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#FEBC2E', border: '1px solid #d4a017' }} />
              <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#28C840', border: '1px solid #1aab29' }} />
              <span style={{ marginLeft: 12, fontSize: 13, color: '#6b7280', fontWeight: 500 }}>FidèleApp — Tableau de bord</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, background: '#dcfce7', color: '#16a34a', padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>● En direct</span>
            </div>

            <div style={{ display: 'flex', minHeight: 500, position: 'relative' }}>
              {/* Sidebar */}
              <div style={{
                width: 195, background: '#fff', borderRight: '1px solid #f0f2f5',
                padding: '20px 0', flexShrink: 0, display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 20px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>FidèleApp</span>
                </div>

                <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', padding: '0 16px 6px', letterSpacing: 1 }}>MENU</div>
                {NAV_ITEMS.map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 12px', margin: '1px 8px', borderRadius: 8,
                    background: item.active ? '#eff6ff' : 'transparent',
                    color: item.active ? '#2563eb' : '#64748b',
                    fontWeight: item.active ? 600 : 400, fontSize: 13,
                  }}>
                    <span style={{ color: item.active ? '#2563eb' : '#94a3b8', display: 'flex' }}>{item.icon}</span>
                    {item.label}
                  </div>
                ))}

                <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', padding: '12px 16px 6px', letterSpacing: 1 }}>PARAMÈTRES</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 12px', margin: '1px 8px', borderRadius: 8,
                  color: '#64748b', fontSize: 13,
                }}>
                  <span style={{ color: '#94a3b8', display: 'flex' }}><IconCompte /></span>
                  Mon compte
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderTop: '1px solid #f0f2f5' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>CP</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Cave du palace</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Bêta · Gratuit</div>
                  </div>
                </div>
              </div>

              {/* Main */}
              <div style={{ flex: 1, padding: '20px 22px', background: '#f8fafc', overflowX: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>Tableau de bord</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>Bonjour — Cave du palace</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 3 }}>
                    {['Jour', 'Semaine', 'Mois'].map((t, i) => (
                      <div key={t} style={{
                        padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                        background: i === 1 ? '#2563eb' : 'transparent',
                        color: i === 1 ? '#fff' : '#64748b',
                      }}>{t}</div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
                  {DASH_METRICS.map(m => (
                    <div key={m.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #f0f2f5' }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' }}>{m.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{m.value}</div>
                      <div style={{ fontSize: 11, color: '#16a34a', background: '#dcfce7', display: 'inline-block', padding: '1px 7px', borderRadius: 20, fontWeight: 600 }}>{m.change}</div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #f0f2f5' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>Évolution des clients fidèles</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>Nombre total cumulé</div>
                    <svg viewBox="0 0 260 70" style={{ width: '100%', height: 65 }}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15"/>
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M0,68 L22,67 L44,66 L66,64 L88,61 L110,56 L132,48 L154,38 L176,28 L198,18 L220,11 L242,7 L260,4" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M0,68 L22,67 L44,66 L66,64 L88,61 L110,56 L132,48 L154,38 L176,28 L198,18 L220,11 L242,7 L260,4 L260,70 L0,70Z" fill="url(#grad)"/>
                    </svg>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #f0f2f5' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>Moyenne pts / client actif</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>Par semaine</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 65, padding: '0 2px' }}>
                      {BAR_DATA.map((h, i) => (
                        <div key={i} style={{
                          flex: 1, borderRadius: 3,
                          background: i === BAR_DATA.length - 1 ? '#2563eb' : '#bfdbfe',
                          height: `${h}%`,
                        }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Transactions */}
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #f0f2f5', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #f0f2f5' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Dernières transactions</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>9 au total</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr auto auto' }}>
                    {['CLIENT', 'DESCRIPTION', 'TYPE', 'POINTS', 'DATE'].map(h => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', padding: '6px 12px', borderBottom: '1px solid #f8fafc' }}>{h}</div>
                    ))}
                    {DASH_CLIENTS.map(c => (
                      <>
                        <div key={c.name+'n'} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderBottom: '1px solid #f8fafc' }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{c.ini}</div>
                          <span style={{ fontSize: 12, color: '#1e293b', fontWeight: 500 }}>{c.name}</span>
                        </div>
                        <div key={c.name+'d'} style={{ padding: '8px 12px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: '#64748b' }}>{c.desc}</span>
                        </div>
                        <div key={c.name+'t'} style={{ padding: '8px 12px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center' }}>
                          <span style={{
                            fontSize: 11,
                            background: c.typeColor + '22',
                            color: c.typeColor,
                            padding: '2px 8px',
                            borderRadius: 20,
                            fontWeight: 600,
                            fontFamily: c.type === 'bonus_bienvenue' ? 'monospace' : 'inherit',
                            letterSpacing: c.type === 'bonus_bienvenue' ? '-0.3px' : 'normal',
                          }}>{c.type}</span>
                        </div>
                        <div key={c.name+'p'} style={{ padding: '8px 12px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: c.ptColor, fontWeight: 700 }}>{c.pts}</span>
                        </div>
                        <div key={c.name+'da'} style={{ padding: '8px 12px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>18/03/26</span>
                        </div>
                      </>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className={styles.problem}>
        <div className="container">
          <div className={styles.sectionLabel}>Le problème</div>
          <h2 className={styles.sectionTitle}>Les grandes enseignes fidélisent.<br />Vous, pas encore.</h2>
          <p className={styles.sectionSub}>Carrefour, Sephora, McDonald's ont tous un programme de fidélité. Pourquoi pas vous ?</p>
          <div className={styles.probGrid}>
            <div className={`${styles.probCard} ${styles.bad}`}>
              <div className={styles.probTitle}>Sans programme de fidélité</div>
              <div className={styles.probDesc}>Vos clients passent chez vous, puis chez le concurrent. Aucune raison de revenir spécifiquement chez vous.</div>
            </div>
            <div className={`${styles.probCard} ${styles.bad}`}>
              <div className={styles.probTitle}>Vous perdez des clients sans le savoir</div>
              <div className={styles.probDesc}>Un client absent depuis 3 semaines — vous ne le savez pas. Impossible d'agir pour le récupérer.</div>
            </div>
            <div className={`${styles.probCard} ${styles.good}`}>
              <div className={styles.probTitle}>Avec FidèleApp</div>
              <div className={styles.probDesc}>Vos clients gagnent des points à chaque visite. Une vraie raison de revenir — et vous les relancez automatiquement.</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className={styles.how}>
        <div className="container">
          <div className={styles.sectionLabel}>Comment ça marche</div>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 36 }}>Opérationnel en 5 minutes.</h2>
          <div className={styles.steps}>
            {[
              ['1', 'Créez votre compte', 'Nom de votre commerce, logo, couleurs. 2 minutes chrono.'],
              ['2', 'Configurez vos règles', '1 point par euro dépensé, 200 pts = café offert. Vous décidez tout.'],
              ['3', 'Vos clients s\'inscrivent', 'QR code sur votre comptoir. Inscription en 30 secondes.'],
              ['4', 'Ils reviennent.', 'Notifications, offres anniversaire, relances. FidèleApp travaille pour vous.'],
            ].map(([n, t, d]) => (
              <div key={n} className={styles.step}>
                <div className={styles.stepNum}>{n}</div>
                <div className={styles.stepTitle}>{t}</div>
                <div className={styles.stepDesc}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features} id="features">
        <div className="container">
          <div className={styles.sectionLabel}>Fonctionnalités</div>
          <h2 className={styles.sectionTitle}>Tout ce qu'il vous faut.</h2>
          <div className={styles.featGrid}>
            {FEATURES.map(f => (
              <div key={f.name} className={styles.feat}>
                <div className={styles.featIcon}>{f.icon}</div>
                <div className={styles.featName}>{f.name}</div>
                <div className={styles.featDesc}>{f.desc}</div>
                <span className={styles.featPill}>{f.pill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className={styles.pricing} id="pricing">
        <div className="container">
          <div className={styles.sectionLabel}>Tarifs</div>
          <h2 className={styles.sectionTitle}>Un seul programme. <span>Tout inclus.</span></h2>
          <p className={styles.sectionSub}>Choisissez comment vous payez — les fonctionnalités sont identiques.</p>
          <div className={styles.pricingGrid}>
            <div className={styles.plan}>
              <div className={styles.planName}>Mensuel</div>
              <div className={styles.planPrice}><span>€</span>29<span className={styles.planPer}>/mois</span></div>
              <p className={styles.planTagline}>Payez mois par mois, sans engagement. Résiliez à tout moment.</p>
              <ul className={styles.planFeats}>
                {['Clients illimités', 'Carte de fidélité digitale', 'Récompenses illimitées', 'QR Code d\'inscription', 'Notifications SMS & push', 'Offres d\'anniversaire auto', 'Relance clients inactifs', 'Dashboard & statistiques', 'Support 7j/7'].map(f => (
                  <li key={f}><span className={styles.check}>✓</span>{f}</li>
                ))}
              </ul>
              <button className={styles.btnPlanGhost} onClick={() => navigate('/inscription')}>Essai gratuit 14 jours</button>
              <p className={styles.planNote}>Sans carte bancaire · Annulation à tout moment</p>
            </div>
            <div className={`${styles.plan} ${styles.planHot}`}>
              <div className={styles.planBadge}>2 mois offerts</div>
              <div className={styles.planName}>Annuel</div>
              <div className={styles.planPrice}><span>€</span>199<span className={styles.planPer}>/an</span></div>
              <div className={styles.planEquiv}>soit 16,60 €/mois — économisez 149 €</div>
              <p className={styles.planTagline}>Un seul paiement par an. La même chose, mais moins cher.</p>
              <ul className={styles.planFeats}>
                {['Clients illimités', 'Carte de fidélité digitale', 'Récompenses illimitées', 'QR Code d\'inscription', 'Notifications SMS & push', 'Offres d\'anniversaire auto', 'Relance clients inactifs', 'Dashboard & statistiques', 'Support 7j/7'].map(f => (
                  <li key={f}><span className={styles.checkHot}>✓</span>{f}</li>
                ))}
              </ul>
              <button className={styles.btnPlanBlue} onClick={() => navigate('/inscription')}>Choisir l'annuel →</button>
              <p className={styles.planNote}>Facture annuelle · Renouvellement automatique</p>
            </div>
          </div>
          <p className={styles.pricingNote}>Pas de commission sur vos ventes · Pas de frais cachés · RGPD compliant</p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testimonials} id="testi">
        <div className="container">
          <div className={styles.sectionLabel}>Témoignages</div>
          <h2 className={styles.sectionTitle}>Des commerçants comme vous.</h2>
          <div className={styles.testiGrid}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className={styles.testi}>
                <span className={styles.testiType}>{t.type}</span>
                <div className={styles.stars}>★★★★★</div>
                <p className={styles.testiQuote}>{t.quote}</p>
                <div className={styles.testiAuthor}>
                  <div className={styles.testiAv}>{t.ini}</div>
                  <div>
                    <div className={styles.testiName}>{t.name}</div>
                    <div className={styles.testiRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>Créez votre programme<br />de fidélité aujourd'hui.</h2>
            <p className={styles.ctaSub}>14 jours gratuits · Sans carte bancaire · Opérationnel en 5 minutes</p>
            <div className={styles.ctaBtns}>
              <button className={styles.btnWhite} onClick={() => navigate('/inscription')}>Démarrer gratuitement →</button>
              <button className={styles.btnWhiteGhost}>Voir la démo</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerTop}>
            <div>
              <div className={styles.logo} style={{ marginBottom: 8 }}>
                <div className={styles.logoMark}><svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2"><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg></div>
                FidèleApp
              </div>
              <div className={styles.footerTagline}>Le programme de fidélité des commerçants de proximité français.</div>
            </div>
            <div className={styles.footerCols}>
              <div><h4>Produit</h4><a>Fonctionnalités</a><a>Tarifs</a><a>Sécurité</a><a>Nouveautés</a></div>
              <div><h4>Ressources</h4><a>Blog</a><a>Guides</a><a>FAQ</a><a>Support</a></div>
              <div><h4>Légal</h4><a>CGU</a><a>Confidentialité</a><a>RGPD</a></div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2025 FidèleApp · Fait avec soin en France</span>
            <span>contact@fidele-app.fr</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
