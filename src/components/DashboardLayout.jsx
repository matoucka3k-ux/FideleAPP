import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

const NAV = [
  { to: '/dashboard', label: 'Tableau de bord', end: true, icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg> },
  { to: '/dashboard/encaisser', label: 'Encaisser', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="8" width="6" height="7" rx="1"/><rect x="9" y="5" width="6" height="10" rx="1"/><rect x="1" y="1" width="6" height="5" rx="1"/></svg> },
  { to: '/dashboard/clients', label: 'Mes clients', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg> },
  { to: '/dashboard/points', label: 'Système de points', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 2l1.2 2.5 2.8.4-2 2 .5 2.8L8 8.4 5.5 9.7 6 6.9 4 4.9l2.8-.4z"/></svg> },
]

const FAQ = [
  { keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou'], answer: `Bonjour et bienvenue sur le support FidèleApp !\n\nJe suis votre assistant. Voici les sujets sur lesquels je peux vous aider :\n\n• **Tableau de bord** — statistiques et transactions\n• **Encaisser** — créditer des points à vos clients\n• **Mes clients** — gérer votre liste de clients\n• **Système de points** — articles, récompenses et bonus\n• **QR Code** — inscription de vos clients\n\nComment puis-je vous aider aujourd'hui ?` },
  { keywords: ['tableau de bord', 'dashboard', 'statistique', 'graphique', 'chiffre', 'performance'], answer: `Votre **Tableau de bord** vous donne une vue complète de votre activité :\n\n• **Clients fidèles** — nombre total de clients inscrits\n• **Achats enregistrés** — transactions du mois\n• **Points distribués** — total des points attribués\n• **Récompenses offertes** — échanges effectués\n\nVous pouvez filtrer par **Jour / Semaine / Mois** en haut à droite.\n\nD'autres questions ? **support@fidele-app.fr**` },
  { keywords: ['encaisser', 'caisse', 'crediter', 'créditer', 'valider achat'], answer: `Pour encaisser un client :\n\n1. Cliquez sur **Encaisser** dans le menu\n2. Recherchez le client par nom ou téléphone\n3. Sélectionnez les articles achetés\n4. Vérifiez le panier\n5. Cliquez sur **"Valider et créditer les points"**\n\nLes points sont immédiatement crédités.\n\nBesoin d'aide ? **support@fidele-app.fr**` },
  { keywords: ['mes clients', 'liste clients', 'voir clients', 'gérer clients'], answer: `Dans **Mes clients** vous pouvez :\n\n• Voir tous vos clients avec leur solde\n• Rechercher par nom ou téléphone\n• Consulter l'historique de points\n\nSi un client n'apparaît pas, il n'est pas encore inscrit — invitez-le à scanner votre QR code.\n\n**support@fidele-app.fr**` },
  { keywords: ['systeme de points', 'système de points', 'points', 'configurer points'], answer: `Le **Système de points** se configure en 3 parties :\n\n1. **Bonus de bienvenue** — points offerts à l'inscription\n2. **Articles & catégories** — points par article\n3. **Récompenses** — ce que les clients obtiennent\n\nTout se configure dans **Système de points** dans le menu.\n\n**support@fidele-app.fr**` },
  { keywords: ['article', 'ajouter article', 'categorie', 'catégorie', 'produit'], answer: `Pour ajouter un article :\n\n1. Allez dans **Système de points**\n2. Section **"Articles & catégories"**\n3. Cliquez sur **"+ Ajouter un article"**\n4. Entrez le nom et les points\n5. Sauvegardez\n\nExemples : Baguette = 5 pts, Café = 10 pts, Menu = 30 pts\n\n**support@fidele-app.fr**` },
  { keywords: ['recompense', 'récompense', 'cadeau', 'echange', 'échange'], answer: `Pour créer une récompense :\n\n1. Allez dans **Système de points**\n2. Section **"Récompenses"**\n3. Cliquez sur **"+ Ajouter une récompense"**\n4. Entrez le nom et les points requis\n5. Sauvegardez\n\nConseil : une récompense accessible dès 200-300 pts motive rapidement.\n\n**support@fidele-app.fr**` },
  { keywords: ['bonus', 'bienvenue', 'bonus bienvenue', 'points offerts'], answer: `Pour configurer le bonus de bienvenue :\n\n1. Allez dans **Système de points**\n2. Section **"Bonus de bienvenue"**\n3. Entrez le nombre de points\n4. Sauvegardez\n\nRecommandation : 50 à 100 pts selon vos récompenses.\n\n**support@fidele-app.fr**` },
  { keywords: ['qr', 'qr code', 'imprimer', 'scanner', 'code boutique'], answer: `Pour utiliser votre QR code :\n\n1. Allez dans **Encaisser**\n2. Votre QR code est en haut à gauche\n3. Cliquez sur **"Imprimer"**\n4. Posez-le sur votre comptoir\n\nVos clients le scannent pour s'inscrire en 30 secondes.\n\n**support@fidele-app.fr**` },
  { keywords: ['compte', 'profil', 'modifier', 'nom commerce', 'informations'], answer: `Pour modifier votre compte :\n\n1. Cliquez sur **Mon compte** dans le menu\n2. Modifiez vos informations\n3. Sauvegardez\n\nPour changer votre email ou mot de passe :\n**support@fidele-app.fr**` },
  { keywords: ['deconnect', 'déconnect', 'logout', 'mot de passe oublié'], answer: `Pour vous déconnecter :\n• Cliquez sur la flèche en bas à gauche de la sidebar\n\nMot de passe oublié ?\nContactez : **support@fidele-app.fr**\nNous vous envoyons un lien sous 24h.` },
  { keywords: ['bug', 'marche pas', 'fonctionne pas', 'erreur', 'problème technique'], answer: `Solutions à essayer :\n\n1. Actualisez la page (F5)\n2. Déconnectez-vous et reconnectez-vous\n3. Videz le cache du navigateur\n4. Essayez un autre navigateur\n\nSi le problème persiste :\n**support@fidele-app.fr**\n\nPrécisez ce qui s'est passé + une capture d'écran si possible.` },
  { keywords: ['lent', 'chargement', 'lenteur', 'charge pas'], answer: `Pour résoudre les lenteurs :\n\n1. Vérifiez votre connexion internet\n2. Actualisez la page\n3. Videz le cache du navigateur\n4. Redémarrez votre téléphone\n\nSi ça persiste : **support@fidele-app.fr**` },
  { keywords: ['prix', 'abonnement', 'payer', 'tarif', 'gratuit', 'beta'], answer: `Vous bénéficiez de l'accès **Bêta Gratuit** — toutes les fonctionnalités sont incluses sans frais.\n\nLes tarifs définitifs seront communiqués avant la fin de la Bêta.\n\nQuestions : **support@fidele-app.fr**` },
  { keywords: ['merci', 'super', 'parfait', 'genial', 'top', 'nickel'], answer: `Merci pour ce retour, c'est un plaisir de vous accompagner !\n\nN'hésitez pas à revenir si vous avez d'autres questions.\n\nBonne journée et bonne fidélisation ! **support@fidele-app.fr**` },
  { keywords: ['comment fonctionne', 'comment ca marche', 'comment ça marche', 'aide', 'guide'], answer: `**FidèleApp en 4 étapes :**\n\n1. **Configurez** — Système de points : articles et récompenses\n2. **Affichez** — Encaisser : imprimez votre QR code\n3. **Inscrivez** — Vos clients scannent et créent leur compte\n4. **Encaissez** — Cherchez le client, ajoutez les articles, validez\n\nSuivez tout sur le **Tableau de bord**.\n\n**support@fidele-app.fr**` },
]

function getAutoReply(message) {
  const msg = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const faq of FAQ) {
    if (faq.keywords.some(k => msg.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
      return faq.answer
    }
  }
  return null
}

function formatMessage(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
}

function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour et bienvenue sur le support FidèleApp !\n\nComment puis-je vous aider aujourd\'hui ?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      const reply = getAutoReply(text)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply || `Je n'ai pas trouvé de réponse précise, mais notre équipe peut vous aider.\n\n**support@fidele-app.fr**\n\nNous répondons sous 24h.`
      }])
      setLoading(false)
    }, 800)
  }

  const suggestions = ['Comment ça marche ?', 'Créditer des points', 'Ajouter un article', 'Créer une récompense', 'QR Code boutique', 'J\'ai un bug']

  return (
    <div style={{
      position: 'fixed', bottom: 90, right: 24, zIndex: 1000,
      width: 345, height: 540,
      background: '#111118', borderRadius: 16,
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>Support FidèleApp</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>En ligne — Répond instantanément</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 14, width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '87%', padding: '10px 13px',
              borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: m.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
              border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color: '#e8e8f0', fontSize: 13, lineHeight: 1.65,
            }} dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }} />
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px 12px 12px 2px', padding: '10px 16px' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, letterSpacing: 3 }}>···</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ padding: '4px 10px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => setInput(s)}
              style={{ fontSize: 11, fontWeight: 500, color: '#a78bfa', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Bandeau support */}
      <div style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
        Question sans réponse ? <strong style={{ color: '#818cf8' }}>support@fidele-app.fr</strong>
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Posez votre question..."
          style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#e8e8f0', background: 'rgba(255,255,255,0.05)' }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          style={{ width: 36, height: 36, borderRadius: 9, border: 'none', flexShrink: 0, background: input.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.08)', color: input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.3)', cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M14 2L2 7l5 2 2 5 5-12z"/></svg>
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { commercant, signOut } = useAuth()
  const [chatOpen, setChatOpen] = useState(false)

  const handleSignOut = async () => { await signOut(); navigate('/') }
  const handleLogoClick = () => { navigate('/dashboard'); window.location.reload() }
  const initiales = commercant?.nom_complet?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'FA'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{ width: 220, background: '#0e0e16', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50 }}>

        {/* Logo */}
        <div onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '20px 18px 18px', cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" style={{ width: 13, height: 13 }}><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>FidèleApp</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 10px' }}>
          <div style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px 8px' }}>Menu</div>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 8, marginBottom: 2,
              textDecoration: 'none', fontSize: 13.5, fontWeight: isActive ? 600 : 400,
              color: isActive ? '#818cf8' : 'rgba(255,255,255,0.4)',
              background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
              transition: 'all .15s',
            })}
            onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
            onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
            >
              <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 8px 8px' }}>Paramètres</div>
          <NavLink to="/dashboard/compte" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 8, marginBottom: 2,
            textDecoration: 'none', fontSize: 13.5, fontWeight: isActive ? 600 : 400,
            color: isActive ? '#818cf8' : 'rgba(255,255,255,0.4)',
            background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
            transition: 'all .15s',
          })}>
            <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 13, height: 13 }}><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/></svg>
            </span>
            Mon compte
          </NavLink>
        </nav>

        {/* User */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{initiales}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>{commercant?.nom_commerce || 'Mon commerce'}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)' }}>Bêta · Gratuit</div>
          </div>
          <button onClick={handleSignOut} title="Se déconnecter"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
          >
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M9 2h2a1 1 0 011 1v7a1 1 0 01-1 1H9"/><path d="M6 9l3-3-3-3M1 7h8"/></svg>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, marginLeft: 220, minHeight: '100vh', background: '#0d0d14' }}>
        <Outlet />
      </main>

      {/* Chat button */}
      <button onClick={() => setChatOpen(o => !o)}
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 24px rgba(99,102,241,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {chatOpen
          ? <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.2" style={{ width: 16, height: 16 }}><path d="M3 3l10 10M13 3L3 13"/></svg>
          : <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.8" style={{ width: 18, height: 18 }}><path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H9l-3 3v-3H3a1 1 0 01-1-1V3z"/></svg>
        }
      </button>

      {chatOpen && <ChatBot onClose={() => setChatOpen(false)} />}
    </div>
  )
}
