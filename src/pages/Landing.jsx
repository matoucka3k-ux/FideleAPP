import { useNavigate } from 'react-router-dom'
import styles from './Landing.module.css'

const FEATURES = [
  { icon: '01', name: 'Carte de fidélité digitale', desc: 'Vos clients ont leur carte sur leur téléphone. Fini les cartons perdus.', pill: 'Zéro papier' },
  { icon: '02', name: 'Notifications automatiques', desc: 'SMS ou push : anniversaire, points expirés, offre spéciale. On envoie, vous encaissez.', pill: 'Automatique' },
  { icon: '03', name: 'Récompenses sur mesure', desc: 'Café, remise, produit offert. Adapté à votre commerce, vous choisissez tout.', pill: 'Personnalisable' },
  { icon: '04', name: 'Statistiques simples', desc: 'Combien de clients actifs, qui revient, qui s\'en va. Tableau de bord clair, sans jargon.', pill: 'Temps réel' },
  { icon: '05', name: 'QR Code sur comptoir', desc: 'Un QR code à poser sur votre caisse. Inscription en 30 secondes pour vos clients.', pill: 'Plug & play' },
  { icon: '06', name: 'Offre anniversaire', desc: 'FidèleApp envoie automatiquement une récompense le jour d\'anniversaire de vos clients.', pill: 'Fidélise ×2' },
]

const TESTIMONIALS = [
  { type: 'Boulangerie', quote: 'En 3 mois, 180 clients inscrits et mes ventes du matin ont augmenté de 30 %. Les gens viennent exprès pour cumuler leurs points.', name: 'Pierre Martin', role: 'Boulangerie Martin, Lyon', ini: 'PM' },
  { type: 'Coiffeur', quote: 'Avant je perdais des clients sans savoir pourquoi. Maintenant je les relance automatiquement. J\'en ai récupéré que je croyais perdus.', name: 'Sophie Bernard', role: 'Salon L\'Atelier, Bordeaux', ini: 'SB' },
  { type: 'Restaurant', quote: 'Super simple à mettre en place. En 10 minutes c\'était prêt. Mes habitués adorent et ils en parlent autour d\'eux.', name: 'Karim Nasser', role: 'Pizzeria Da Marco, Marseille', ini: 'KN' },
]

const DASH_METRICS = [
  { label: 'Clients fidèles', value: '248', change: '+12 ce mois' },
  { label: 'Achats enregistrés', value: '1 043', change: '+18%' },
  { label: 'Points distribués', value: '14 200', change: '+9%' },
  { label: 'Récompenses offertes', value: '37', change: 'ce mois' },
]

const DASH_CLIENTS = [
  { ini: 'AM', name: 'Alice M.', desc: 'Menu du jour ×2', pts: '+92 pts', type: 'Achat', typeColor: '#22c55e', ptColor: '#16a34a' },
  { ini: 'LB', name: 'Louise B.', desc: 'Bonus de bienvenue', pts: '+50 pts', type: 'Bonus bienvenue', typeColor: '#6366f1', ptColor: '#4f46e5' },
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
    <div style={{ background: '#0a0a0f', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", color: '#e8e8f0', overflowX: 'hidden' }}>

      {/* Grain overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.035, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: '180px' }} />

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" style={{width:12,height:12}}><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>FidèleApp</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Fonctionnalités', 'Tarifs', 'Témoignages'].map((l, i) => (
            <a key={l} href={['#features', '#pricing', '#testi'][i]} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color .2s', letterSpacing: '-0.01em' }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
            >{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => navigate('/client/connexion')}
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >Espace client</button>
          <button
            onClick={() => navigate('/connexion')}
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >Connexion</button>
          <button
            onClick={() => navigate('/inscription')}
            style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity .2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >Créer mon programme</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', paddingTop: 160, paddingBottom: 120, paddingLeft: 40, paddingRight: 40, textAlign: 'center', zIndex: 1 }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, padding: '5px 14px', marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
          <span style={{ fontSize: 12.5, color: 'rgba(99,102,241,0.9)', fontWeight: 500, letterSpacing: '0.02em' }}>Conçu pour les commerçants français</span>
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.04em', marginBottom: 22, color: '#fff', maxWidth: 800, margin: '0 auto 22px' }}>
          Vos clients reviennent.<br />
          <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pas par hasard.</span>
        </h1>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px', fontWeight: 400, letterSpacing: '-0.01em' }}>
          FidèleApp crée votre programme de fidélité en 5 minutes. Cartes de points, récompenses, notifications — une vraie raison de revenir.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
          <button
            onClick={() => navigate('/inscription')}
            style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 10, padding: '12px 28px', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity .2s, transform .2s', letterSpacing: '-0.01em' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none' }}
          >Créer mon programme</button>
          <button
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >Voir un exemple</button>
        </div>
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.01em' }}>Sans engagement · Sans matériel · Sans technicien</p>

        {/* Dashboard preview */}
        <div style={{ maxWidth: 880, margin: '64px auto 0', position: 'relative' }}>
          {/* Border beam effect */}
          <div style={{ position: 'absolute', inset: -1, borderRadius: 17, background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.2), rgba(99,102,241,0.1))', padding: 1, zIndex: 0 }}>
            <div style={{ background: '#0a0a0f', borderRadius: 16, width: '100%', height: '100%' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, background: '#111118', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Mac bar */}
            <div style={{ background: '#16161e', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
              <span style={{ marginLeft: 12, fontSize: 12.5, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>FidèleApp — Tableau de bord</span>
              <span style={{ marginLeft: 'auto', fontSize: 11.5, background: 'rgba(34,197,94,0.12)', color: '#22c55e', padding: '2px 10px', borderRadius: 20, fontWeight: 600, border: '1px solid rgba(34,197,94,0.2)' }}>En direct</span>
            </div>
            <div style={{ display: 'flex', minHeight: 460 }}>
              {/* Sidebar */}
              <div style={{ width: 185, background: '#0e0e16', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '18px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px 18px' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" style={{width:12,height:12}}><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 13.5, color: '#fff', letterSpacing: '-0.02em' }}>FidèleApp</span>
                </div>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.2)', padding: '0 14px 6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Menu</div>
                {NAV_ITEMS.map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', margin: '1px 6px', borderRadius: 7, background: item.active ? 'rgba(99,102,241,0.12)' : 'transparent', color: item.active ? '#818cf8' : 'rgba(255,255,255,0.35)', fontWeight: item.active ? 600 : 400, fontSize: 12.5 }}>
                    <span style={{ display: 'flex' }}>{item.icon}</span>
                    {item.label}
                  </div>
                ))}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>CP</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Cave du palace</div>
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)' }}>Bêta · Gratuit</div>
                  </div>
                </div>
              </div>
              {/* Main */}
              <div style={{ flex: 1, padding: '18px 20px', background: '#0d0d14', overflowX: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>Tableau de bord</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Bonjour — Cave du palace</div>
                  </div>
                  <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 3 }}>
                    {['Jour', 'Semaine', 'Mois'].map((t, i) => (
                      <div key={t} style={{ padding: '4px 11px', borderRadius: 6, fontSize: 11.5, fontWeight: 500, background: i === 1 ? 'rgba(99,102,241,0.25)' : 'transparent', color: i === 1 ? '#818cf8' : 'rgba(255,255,255,0.3)' }}>{t}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                  {DASH_METRICS.map(m => (
                    <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 13px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', marginBottom: 6, textTransform: 'uppercase' }}>{m.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: '-0.03em' }}>{m.value}</div>
                      <div style={{ fontSize: 10.5, color: '#22c55e', background: 'rgba(34,197,94,0.1)', display: 'inline-block', padding: '1px 7px', borderRadius: 20, fontWeight: 600, border: '1px solid rgba(34,197,94,0.15)' }}>{m.change}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Évolution des clients fidèles</div>
                    <svg viewBox="0 0 260 60" style={{ width: '100%', height: 55 }}>
                      <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0"/></linearGradient></defs>
                      <path d="M0,58 L22,57 L44,56 L66,54 L88,51 L110,46 L132,38 L154,28 L176,18 L198,11 L220,6 L242,3 L260,1" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M0,58 L22,57 L44,56 L66,54 L88,51 L110,46 L132,38 L154,28 L176,18 L198,11 L220,6 L242,3 L260,1 L260,60 L0,60Z" fill="url(#g1)"/>
                    </svg>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Moyenne pts / client actif</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 55, padding: '0 2px' }}>
                      {BAR_DATA.map((h, i) => (
                        <div key={i} style={{ flex: 1, borderRadius: '2px 2px 0 0', background: i === BAR_DATA.length - 1 ? 'linear-gradient(to top, #6366f1, #a78bfa)' : 'rgba(99,102,241,0.2)', height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 13px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Dernières transactions</div>
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)' }}>9 au total</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr auto auto' }}>
                    {['CLIENT', 'DESCRIPTION', 'TYPE', 'POINTS', 'DATE'].map(h => (
                      <div key={h} style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.2)', padding: '6px 11px', borderBottom: '1px solid rgba(255,255,255,0.04)', letterSpacing: '0.06em' }}>{h}</div>
                    ))}
                    {DASH_CLIENTS.map(c => (
                      <>
                        <div key={c.name+'n'} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 11px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, fontWeight: 700, flexShrink: 0 }}>{c.ini}</div>
                          <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{c.name}</span>
                        </div>
                        <div key={c.name+'d'} style={{ padding: '7px 11px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{c.desc}</span>
                        </div>
                        <div key={c.name+'t'} style={{ padding: '7px 11px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: 10.5, background: c.typeColor + '18', color: c.typeColor, padding: '2px 7px', borderRadius: 20, fontWeight: 600, border: `1px solid ${c.typeColor}28` }}>{c.type}</span>
                        </div>
                        <div key={c.name+'p'} style={{ padding: '7px 11px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: 11.5, color: c.ptColor, fontWeight: 700 }}>{c.pts}</span>
                        </div>
                        <div key={c.name+'da'} style={{ padding: '7px 11px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.2)' }}>18/03/26</span>
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

      {/* LOGOS BAND */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 40px', display: 'flex', alignItems: 'center', gap: 32, justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Idéal pour</span>
        {['Boulangeries', 'Coiffeurs', 'Restaurants', 'Instituts beauté', 'Boutiques mode', 'Épiceries bio'].map(l => (
          <span key={l} style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500, whiteSpace: 'nowrap' }}>{l}</span>
        ))}
      </div>

      {/* PROBLEM */}
      <section style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 600, color: 'rgba(99,102,241,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '4px 14px' }}>Le problème</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 14 }}>Les grandes enseignes fidélisent.<br />Vous, pas encore.</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', maxWidth: 480, margin: '0 auto' }}>Carrefour, Sephora, McDonald's ont tous un programme de fidélité. Pourquoi pas vous ?</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { bad: true, title: 'Sans programme de fidélité', desc: 'Vos clients passent chez vous, puis chez le concurrent. Aucune raison de revenir spécifiquement chez vous.' },
            { bad: true, title: 'Vous perdez des clients sans le savoir', desc: 'Un client absent depuis 3 semaines — vous ne le savez pas. Impossible d\'agir pour le récupérer.' },
            { bad: false, title: 'Avec FidèleApp', desc: 'Vos clients gagnent des points à chaque visite. Une vraie raison de revenir — et vous les relancez automatiquement.' },
          ].map((c, i) => (
            <div key={i} style={{ background: c.bad ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.06)', border: `1px solid ${c.bad ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.2)'}`, borderRadius: 14, padding: '28px 26px' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: c.bad ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 14 }}>
                {c.bad ? '×' : '✓'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.bad ? 'rgba(255,255,255,0.55)' : '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>{c.title}</div>
              <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.65 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 600, color: 'rgba(99,102,241,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '4px 14px' }}>Comment ça marche</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15 }}>Opérationnel en 5 minutes.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            ['01', 'Créez votre compte', 'Nom de votre commerce, logo, couleurs. 2 minutes chrono.'],
            ['02', 'Configurez vos règles', '1 point par euro dépensé, 200 pts = café offert. Vous décidez tout.'],
            ['03', 'Vos clients s\'inscrivent', 'QR code sur votre comptoir. Inscription en 30 secondes.'],
            ['04', 'Ils reviennent.', 'Notifications, offres anniversaire, relances. FidèleApp travaille pour vous.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '24px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(99,102,241,0.6)', letterSpacing: '0.08em', marginBottom: 14 }}>{n}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', marginBottom: 10 }}>{t}</div>
              <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.65 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 600, color: 'rgba(99,102,241,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '4px 14px' }}>Fonctionnalités</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>Tout ce qu'il vous faut.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {FEATURES.map(f => (
            <div key={f.name} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '24px 22px', transition: 'border-color .2s, background .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(99,102,241,0.5)', letterSpacing: '0.08em', marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>{f.name}</div>
              <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, marginBottom: 16 }}>{f.desc}</div>
              <span style={{ fontSize: 11.5, color: 'rgba(99,102,241,0.7)', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 20, padding: '3px 10px', fontWeight: 600 }}>{f.pill}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 600, color: 'rgba(99,102,241,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '4px 14px' }}>Tarifs</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>Un seul programme. Tout inclus.</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>Choisissez comment vous payez — les fonctionnalités sont identiques.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 720, margin: '0 auto' }}>
          {/* Mensuel */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 28px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 16, letterSpacing: '-0.01em' }}>Mensuel</div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 42, fontWeight: 700, color: '#fff', letterSpacing: '-0.04em' }}>29</span>
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>€/mois</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, marginBottom: 24 }}>Payez mois par mois, sans engagement. Résiliez à tout moment.</p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Clients illimités', 'Carte de fidélité digitale', 'Récompenses illimitées', 'QR Code d\'inscription', 'Notifications SMS & push', 'Dashboard & statistiques', 'Support 7j/7'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: '#6366f1', fontWeight: 700, fontSize: 14 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/inscription')} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14, fontWeight: 600, padding: '12px 0', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >Essai gratuit 14 jours</button>
            <p style={{ textAlign: 'center', fontSize: 11.5, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>Sans carte bancaire</p>
          </div>
          {/* Annuel */}
          <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 16, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #6366f1, #a78bfa)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>Annuel</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#a78bfa', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, padding: '3px 10px' }}>2 mois offerts</div>
            </div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 42, fontWeight: 700, color: '#fff', letterSpacing: '-0.04em' }}>199</span>
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>€/an</span>
            </div>
            <div style={{ fontSize: 12, color: '#a78bfa', marginBottom: 14, fontWeight: 500 }}>soit 16,60 €/mois — économisez 149 €</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, marginBottom: 24 }}>Un seul paiement par an. La même chose, mais moins cher.</p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Clients illimités', 'Carte de fidélité digitale', 'Récompenses illimitées', 'QR Code d\'inscription', 'Notifications SMS & push', 'Dashboard & statistiques', 'Support 7j/7'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'rgba(255,255,255,0.65)' }}>
                  <span style={{ color: '#818cf8', fontWeight: 700, fontSize: 14 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/inscription')} style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, padding: '12px 0', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity .2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >Choisir l'annuel</button>
            <p style={{ textAlign: 'center', fontSize: 11.5, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>Renouvellement automatique</p>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,0.2)', marginTop: 28 }}>Pas de commission sur vos ventes · Pas de frais cachés · RGPD compliant</p>
      </section>

      {/* TESTIMONIALS */}
      <section id="testi" style={{ padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 600, color: 'rgba(99,102,241,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '4px 14px' }}>Témoignages</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>Des commerçants comme vous.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '28px 24px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(99,102,241,0.7)', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '3px 10px', display: 'inline-block', marginBottom: 16 }}>{t.type}</div>
              <div style={{ color: '#f59e0b', fontSize: 13, marginBottom: 14, letterSpacing: '0.05em' }}>★★★★★</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{t.ini}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>{t.name}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
            Créez votre programme<br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>de fidélité aujourd'hui.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', marginBottom: 36 }}>14 jours gratuits · Sans carte bancaire · Opérationnel en 5 minutes</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/inscription')} style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 10, padding: '13px 28px', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity .2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >Démarrer gratuitement</button>
            <button onClick={() => navigate('/client/connexion')} style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '13px 22px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >Espace client</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '56px 40px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" style={{width:12,height:12}}><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>FidèleApp</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', lineHeight: 1.7, maxWidth: 200 }}>Le programme de fidélité des commerçants de proximité français.</div>
            </div>
            {[
              ['Produit', ['Fonctionnalités', 'Tarifs', 'Sécurité', 'Nouveautés']],
              ['Ressources', ['Blog', 'Guides', 'FAQ', 'Support']],
              ['Légal', ['CGU', 'Confidentialité', 'RGPD']],
            ].map(([title, links]) => (
              <div key={title}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18 }}>{title}</div>
                {links.map(l => (
                  <a key={l} href="#" style={{ display: 'block', fontSize: 13.5, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', marginBottom: 11, transition: 'color .2s' }}
                    onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
                  >{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.2)' }}>© 2025 FidèleApp · Fait avec soin en France</span>
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.2)' }}>contact@fidele-app.fr</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
