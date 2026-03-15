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
          <div className={styles.dashCard}>
            <div className={styles.dashBar}>
              <div className={styles.dot} style={{ background: '#FF5F57' }} />
              <div className={styles.dot} style={{ background: '#FEBC2E' }} />
              <div className={styles.dot} style={{ background: '#28C840' }} />
              <span className={styles.dashBarTitle}>FidèleApp — Tableau de bord</span>
              <span className={styles.dashLive}>En direct</span>
            </div>
            <div className={styles.dashBody}>
              <div className={styles.dashMetrics}>
                {[['Clients fidèles', '248', '+12 ce mois'], ['Visites ce mois', '1 043', '+18%'], ['Points distribués', '14 200', '+9%'], ['Récompenses offertes', '37', 'ce mois']].map(([l, v, c]) => (
                  <div key={l} className={styles.dm}>
                    <div className={styles.dmLbl}>{l}</div>
                    <div className={styles.dmVal}>{v}</div>
                    <div className={styles.dmChg}>{c}</div>
                  </div>
                ))}
              </div>
              <div className={styles.dashRow}>
                <div className={styles.chartBlock}>
                  <div className={styles.chartLbl}>Visites sur 12 semaines</div>
                  <div className={styles.bars}>
                    {[40, 52, 44, 63, 55, 75, 66, 82, 71, 90, 80, 100].map((h, i) => (
                      <div key={i} className={styles.bar} style={{ height: `${h}%`, opacity: 0.3 + (i / 11) * 0.7 }} />
                    ))}
                  </div>
                </div>
                <div className={styles.membersList}>
                  <div className={styles.chartLbl}>Derniers clients</div>
                  {[['AM', 'Alice M.', '620 pts'], ['BP', 'Bruno P.', '380 pts'], ['CR', 'Camille R.', '1 200 pts'], ['DM', 'David M.', '90 pts']].map(([ini, name, pts]) => (
                    <div key={name} className={styles.mlRow}>
                      <div className={styles.mlAv}>{ini}</div>
                      <div className={styles.mlName}>{name}</div>
                      <div className={styles.mlPts}>{pts}</div>
                    </div>
                  ))}
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
