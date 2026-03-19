import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import styles from './DashboardLayout.module.css'

const NAV = [
  { to: '/dashboard', label: 'Tableau de bord', end: true, icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg> },
  { to: '/dashboard/encaisser', label: 'Encaisser', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="8" width="6" height="7" rx="1"/><rect x="9" y="5" width="6" height="10" rx="1"/><rect x="1" y="1" width="6" height="5" rx="1"/></svg> },
  { to: '/dashboard/clients', label: 'Mes clients', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg> },
  { to: '/dashboard/points', label: 'Système de points', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 2l1.2 2.5 2.8.4-2 2 .5 2.8L8 8.4 5.5 9.7 6 6.9 4 4.9l2.8-.4z"/></svg> },
]

const FAQ = [
  {
    keywords: ['points', 'créditer', 'ajouter', 'attribuer', 'bug', 'marche pas', 'fonctionne pas'],
    answer: 'Pour créditer des points : allez dans **Encaisser**, cherchez le client, ajoutez les articles achetés puis cliquez "Valider". Si ça ne fonctionne pas, vérifiez que vos articles sont bien configurés dans "Système de points".'
  },
  {
    keywords: ['article', 'configurer', 'créer', 'ajouter article', 'catégorie'],
    answer: 'Pour ajouter des articles : allez dans **Système de points** → section "Articles & catégories". Entrez le nom de l\'article et le nombre de points qu\'il rapporte, puis sauvegardez.'
  },
  {
    keywords: ['récompense', 'cadeau', 'échange', 'offrir'],
    answer: 'Pour créer une récompense : allez dans **Système de points** → section "Récompenses". Définissez le nom (ex: "Café offert") et le nombre de points nécessaires pour l\'obtenir.'
  },
  {
    keywords: ['client', 'inscription', 'inscrire', 'rejoindre', 'nouveau'],
    answer: 'Pour inscrire un nouveau client : allez dans **Encaisser** et imprimez votre QR code boutique. Le client le scanne, crée son compte en 30 secondes et reçoit son QR code personnel.'
  },
  {
    keywords: ['qr', 'qr code', 'imprimer', 'afficher'],
    answer: 'Votre QR code boutique est disponible dans **Encaisser**. Cliquez sur "Imprimer" pour l\'afficher et le poser sur votre comptoir.'
  },
  {
    keywords: ['bonus', 'bienvenue', 'nouveau client'],
    answer: 'Le bonus de bienvenue est offert automatiquement à chaque nouveau client inscrit. Vous pouvez modifier ce nombre dans **Système de points** → "Bonus de bienvenue".'
  },
  {
    keywords: ['statistique', 'graphique', 'données', 'tableau de bord', 'chiffre'],
    answer: 'Toutes vos statistiques sont sur le **Tableau de bord** : clients fidèles, achats, points distribués, récompenses offertes, et graphiques d\'évolution.'
  },
  {
    keywords: ['compte', 'profil', 'modifier', 'nom', 'commerce'],
    answer: 'Pour modifier les informations de votre commerce : allez dans **Mon compte** depuis le menu de gauche.'
  },
  {
    keywords: ['supprimer', 'effacer', 'enlever client'],
    answer: 'La suppression de client est disponible dans **Mes clients**. Cliquez sur le client puis cherchez l\'option de suppression.'
  },
  {
    keywords: ['déconnect', 'logout', 'sortir'],
    answer: 'Pour vous déconnecter : cliquez sur la flèche de déconnexion en bas à gauche de la sidebar.'
  },
  {
    keywords: ['prix', 'abonnement', 'payer', 'gratuit', 'bêta'],
    answer: 'Vous êtes actuellement en accès Bêta Gratuit. Profitez-en ! Pour toute question sur les tarifs, contactez support@fidele-app.fr'
  },
]

function getAutoReply(message) {
  const msg = message.toLowerCase()
  for (const faq of FAQ) {
    if (faq.keywords.some(k => msg.includes(k))) {
      return faq.answer
    }
  }
  return null
}

function formatMessage(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! 👋 Je suis l\'assistant FidèleApp. Posez-moi votre question sur l\'utilisation de l\'application.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const reply = getAutoReply(text)
      if (reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Je n\'ai pas bien compris votre question. Pouvez-vous préciser ? Vous pouvez aussi contacter directement notre équipe à **support@fidele-app.fr** — nous répondons sous 24h.'
        }])
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 90, right: 24, zIndex: 1000,
      width: 340, height: 480,
      background: '#fff', borderRadius: 16,
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      border: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ background: '#2563EB', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Support FidèleApp</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>● En ligne</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                maxWidth: '82%', padding: '9px 12px',
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: m.role === 'user' ? '#2563EB' : '#F1F5F9',
                color: m.role === 'user' ? '#fff' : '#1e293b',
                fontSize: 13, lineHeight: 1.55,
              }}
              dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }}
            />
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#F1F5F9', borderRadius: '12px 12px 12px 2px', padding: '10px 16px', fontSize: 18, letterSpacing: 2 }}>
              <span style={{ color: '#94a3b8' }}>···</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions rapides */}
      {messages.length === 1 && (
        <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Créditer des points', 'Ajouter un article', 'Créer une récompense', 'QR Code boutique'].map(s => (
            <button key={s} onClick={() => { setInput(s); setTimeout(() => document.getElementById('chatInput')?.focus(), 50) }}
              style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #f0f2f5', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          id="chatInput"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Posez votre question..."
          style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#1e293b', background: '#f8fafc' }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            width: 36, height: 36, borderRadius: 9, border: 'none', flexShrink: 0,
            background: input.trim() && !loading ? '#2563EB' : '#E2E8F0',
            color: input.trim() && !loading ? '#fff' : '#94A3B8',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
            <path d="M14 2L2 7l5 2 2 5 5-12z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { commercant, signOut } = useAuth()
  const [chatOpen, setChatOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleLogoClick = () => {
    navigate('/dashboard')
    window.location.reload()
  }

  const initiales = commercant?.nom_complet?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'FA'

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo} onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2"><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
          </div>
          <span>FidèleApp</span>
        </div>
        <nav className={styles.nav}>
          <div className={styles.navSection}>Menu</div>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className={styles.navSection} style={{ marginTop: 8 }}>Paramètres</div>
          <NavLink to="/dashboard/compte"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <span className={styles.navIcon}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/></svg>
            </span>
            <span>Mon compte</span>
          </NavLink>
        </nav>
        <div className={styles.user}>
          <div className={styles.avatar}>{initiales}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={styles.userName}>{commercant?.nom_commerce || 'Mon commerce'}</div>
            <div className={styles.userPlan}>Bêta · Gratuit</div>
          </div>
          <button onClick={handleSignOut} title="Se déconnecter" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M9 2h2a1 1 0 011 1v7a1 1 0 01-1 1H9"/><path d="M6 9l3-3-3-3M1 7h8"/></svg>
          </button>
        </div>
      </aside>

      <main className={styles.main}><Outlet /></main>

      {/* Bouton chatbot */}
      <button
        onClick={() => setChatOpen(o => !o)}
        title="Support"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          width: 52, height: 52, borderRadius: '50%',
          background: '#2563EB', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {chatOpen ? (
          <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.2" style={{ width: 18, height: 18 }}>
            <path d="M3 3l10 10M13 3L3 13"/>
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.8" style={{ width: 20, height: 20 }}>
            <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H9l-3 3v-3H3a1 1 0 01-1-1V3z"/>
          </svg>
        )}
      </button>

      {chatOpen && <ChatBot onClose={() => setChatOpen(false)} />}
    </div>
  )
}
