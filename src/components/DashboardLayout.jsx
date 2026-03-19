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
  // SALUTATIONS
  {
    keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'bonne journee'],
    answer: `Bonjour et bienvenue sur le support FidèleApp ! 👋😊\n\nJe suis votre assistant et je suis là pour vous accompagner. Voici les sujets sur lesquels je peux vous aider :\n\n• 📊 **Tableau de bord** — statistiques et transactions\n• 💰 **Encaisser** — créditer des points à vos clients\n• 👥 **Mes clients** — gérer votre liste de clients\n• ⭐ **Système de points** — articles, récompenses et bonus\n• 📱 **QR Code** — inscription de vos clients\n\nPour quel sujet puis-je vous aider aujourd'hui ?`
  },

  // TABLEAU DE BORD
  {
    keywords: ['tableau de bord', 'dashboard', 'statistique', 'graphique', 'chiffre', 'performance', 'evolution', 'résultat', 'données'],
    answer: `Bonjour ! Merci pour votre question sur le Tableau de bord. 📊\n\nVotre **Tableau de bord** vous donne une vue complète de votre activité :\n\n• **Clients fidèles** — nombre total de clients inscrits\n• **Achats enregistrés** — transactions du mois en cours\n• **Points distribués** — total des points attribués\n• **Récompenses offertes** — nombre d'échanges effectués\n\n📈 Les **graphiques** vous montrent l'évolution semaine par semaine. Vous pouvez filtrer par **Jour / Semaine / Mois** en haut à droite.\n\n💡 Si vos statistiques affichent 0, cela signifie qu'aucun client n'est encore inscrit. Rendez-vous dans **Encaisser** pour imprimer votre QR code et commencer à accueillir vos premiers clients !\n\nD'autres questions ? Notre équipe est disponible à **support@fidele-app.fr** 🙏`
  },

  // ENCAISSER — GÉNÉRAL
  {
    keywords: ['encaisser', 'caisse', 'crediter', 'créditer', 'valider achat', 'enregistrer achat'],
    answer: `Bonjour ! Je vais vous guider pour encaisser un client. 😊\n\nVoici comment procéder étape par étape :\n\n1. Cliquez sur **Encaisser** dans le menu à gauche\n2. Dans la barre de recherche, tapez le **nom ou téléphone** de votre client\n3. Cliquez sur le client dans la liste\n4. Dans l'onglet **"Articles achetés"**, sélectionnez les articles qu'il a achetés\n5. Vérifiez le **récapitulatif du panier**\n6. Cliquez sur **"Valider et créditer les points"**\n\n✅ Les points sont immédiatement crédités sur le compte de votre client !\n\n💡 Si votre client n'apparaît pas dans la liste, il n'est pas encore inscrit. Invitez-le à scanner votre **QR code boutique** pour créer son compte.\n\nBesoin d'aide supplémentaire ? **support@fidele-app.fr** 🙏`
  },

  // AJOUTER CLIENT MANUELLEMENT
  {
    keywords: ['ajouter client', 'creer client', 'créer client', 'nouveau client manuellement', 'inscrire manuellement', 'client manuellement'],
    answer: `Bonjour ! Excellente question sur l'ajout manuel d'un client. 😊\n\nActuellement, l'inscription des clients se fait via le **QR code boutique** — c'est la méthode principale et la plus rapide (30 secondes pour le client).\n\nVoici comment procéder :\n1. Allez dans **Encaisser**\n2. Imprimez votre **QR code boutique**\n3. Votre client le scanne avec son téléphone\n4. Il remplit son nom et téléphone\n5. Il est immédiatement inscrit et apparaît dans **Mes clients**\n\n💡 Si vous souhaitez inscrire un client qui n'a pas de smartphone, contactez notre équipe — nous étudions cette fonctionnalité : **support@fidele-app.fr** 🙏`
  },

  // MES CLIENTS — GÉNÉRAL
  {
    keywords: ['mes clients', 'liste clients', 'voir clients', 'gérer clients', 'client introuvable', 'chercher client'],
    answer: `Bonjour ! Je vais vous expliquer comment gérer vos clients. 👥\n\nDans la section **Mes clients** vous pouvez :\n\n• **Voir tous vos clients** inscrits avec leur solde de points\n• **Rechercher** un client par nom ou téléphone\n• **Consulter l'historique** de points de chaque client\n• **Voir les récompenses** débloquées par client\n\n🔍 Pour trouver un client rapidement :\n1. Allez dans **Mes clients**\n2. Utilisez la barre de recherche en haut\n3. Tapez les premières lettres du nom ou son numéro\n\n💡 Si un client n'apparaît pas, c'est qu'il n'est pas encore inscrit. Invitez-le à scanner votre **QR code** dans **Encaisser**.\n\nPour toute question : **support@fidele-app.fr** 🙏`
  },

  // SUPPRIMER CLIENT
  {
    keywords: ['supprimer client', 'effacer client', 'enlever client', 'retirer client'],
    answer: `Bonjour ! Je comprends votre demande concernant la suppression d'un client. 😊\n\nPour supprimer un client :\n1. Allez dans **Mes clients**\n2. Cliquez sur le client concerné\n3. Cherchez l'option **Supprimer**\n\n⚠️ **Attention importante** : la suppression est **définitive**. Tout l'historique de points et de transactions de ce client sera effacé et ne pourra pas être récupéré.\n\n💡 Si vous avez besoin de supprimer plusieurs clients en même temps ou si vous ne trouvez pas l'option, notre équipe peut vous aider directement : **support@fidele-app.fr** — nous répondons sous 24h. 🙏`
  },

  // SYSTÈME DE POINTS — GÉNÉRAL
  {
    keywords: ['systeme de points', 'système de points', 'points', 'comment marche', 'configurer points'],
    answer: `Bonjour ! Je vais vous expliquer le fonctionnement du système de points. ⭐\n\nLe **Système de points** se configure en 3 parties :\n\n**1. Bonus de bienvenue**\nPoints offerts automatiquement à chaque nouveau client inscrit.\n→ Recommandé : 50 pts pour encourager l'inscription\n\n**2. Articles & catégories**\nDéfinissez combien de points chaque article rapporte.\n→ Ex : Café = 10 pts, Baguette = 5 pts, Menu = 30 pts\n\n**3. Récompenses**\nCe que vos clients obtiennent en échangeant leurs points.\n→ Ex : Café offert = 200 pts, Remise 5€ = 500 pts\n\n📍 Tout se configure dans le menu **Système de points** à gauche.\n\nVous avez d'autres questions sur la configuration ? **support@fidele-app.fr** 🙏`
  },

  // AJOUTER ARTICLE
  {
    keywords: ['article', 'ajouter article', 'créer article', 'configurer article', 'categorie', 'catégorie', 'produit'],
    answer: `Bonjour ! Je vais vous guider pour ajouter vos articles. 😊\n\nPour ajouter un article ou une catégorie :\n1. Allez dans **Système de points** (menu à gauche)\n2. Trouvez la section **"Articles & catégories"**\n3. Cliquez sur **"+ Ajouter un article ou une catégorie"**\n4. Entrez le **nom de l'article** (ex : Baguette, Café, Coupe femme...)\n5. Entrez le **nombre de points** qu'il rapporte\n6. Cliquez sur **Sauvegarder**\n\n💡 **Quelques exemples de configuration :**\n• Boulangerie : Baguette = 5 pts, Viennoiserie = 8 pts\n• Coiffeur : Coupe homme = 40 pts, Coupe femme = 60 pts\n• Restaurant : Menu du jour = 30 pts, Formule = 50 pts\n\nUne fois vos articles créés, ils apparaîtront dans **Encaisser** pour créditer vos clients facilement.\n\nBesoin d'aide ? **support@fidele-app.fr** 🙏`
  },

  // RÉCOMPENSES
  {
    keywords: ['recompense', 'récompense', 'cadeau', 'echange', 'échange', 'offrir', 'créer récompense', 'ajouter récompense'],
    answer: `Bonjour ! Les récompenses sont un élément clé pour fidéliser vos clients. 🎁\n\nPour créer une récompense :\n1. Allez dans **Système de points** (menu à gauche)\n2. Trouvez la section **"Récompenses"**\n3. Cliquez sur **"+ Ajouter une récompense"**\n4. Entrez le **nom de la récompense** (ex : Café offert, Remise 5€)\n5. Définissez les **points nécessaires** pour l'obtenir\n6. Sauvegardez\n\n💡 **Conseils pour bien calibrer vos récompenses :**\n• Proposez une récompense accessible dès **200-300 pts** pour motiver rapidement\n• Ajoutez une récompense premium à **1000+ pts** pour les clients fidèles\n• Variez les récompenses (produit offert, remise, service gratuit)\n\nUne fois créées, vos clients peuvent les échanger depuis **Encaisser** → onglet **Récompenses**.\n\nQuestions supplémentaires ? **support@fidele-app.fr** 🙏`
  },

  // BONUS DE BIENVENUE
  {
    keywords: ['bonus', 'bienvenue', 'bonus bienvenue', 'points offerts', 'cadeau inscription', 'points inscription'],
    answer: `Bonjour ! Le bonus de bienvenue est une excellente façon de démarrer avec vos nouveaux clients. 🎉\n\nPour configurer le bonus de bienvenue :\n1. Allez dans **Système de points** (menu à gauche)\n2. Trouvez la section **"Bonus de bienvenue"**\n3. Entrez le nombre de points à offrir\n4. Sauvegardez\n\n✅ Ce bonus est crédité **automatiquement** dès qu'un nouveau client s'inscrit via votre QR code.\n\n💡 **Notre recommandation :**\n• **50 pts** : discret mais apprécié\n• **100 pts** : motivant pour s'inscrire\n• **200 pts** : très incitatif si vos récompenses démarrent à 500 pts\n\nAdaptez ce montant selon vos récompenses pour que le bonus représente environ **20-30%** de la première récompense.\n\nD'autres questions ? **support@fidele-app.fr** 🙏`
  },

  // QR CODE
  {
    keywords: ['qr', 'qr code', 'imprimer', 'afficher', 'scanner', 'code boutique'],
    answer: `Bonjour ! Je vais vous expliquer comment utiliser votre QR code. 📱\n\nVotre **QR code boutique** est le point d'entrée pour l'inscription de vos clients.\n\nPour l'imprimer :\n1. Allez dans **Encaisser** (menu à gauche)\n2. Vous verrez votre QR code en haut à gauche\n3. Cliquez sur **"Imprimer"**\n4. Une page s'ouvre avec votre QR code en grand\n5. Imprimez et posez-le sur votre comptoir\n\n**Comment ça fonctionne pour votre client :**\n1. Il scanne le QR code avec son téléphone\n2. Il entre son nom et numéro de téléphone\n3. Il reçoit son **QR code personnel**\n4. À chaque visite, il présente son QR code pour cumuler ses points\n\n💡 Conseil : **plastifiez** votre QR code pour qu'il dure dans le temps !\n\nSouci d'impression ? **support@fidele-app.fr** 🙏`
  },

  // UTILISER UNE RÉCOMPENSE CLIENT
  {
    keywords: ['utiliser récompense', 'echanger points', 'échanger points', 'client veut échanger', 'récompense client'],
    answer: `Bonjour ! Je vais vous expliquer comment un client peut utiliser ses points. 🎁\n\nPour utiliser une récompense :\n1. Allez dans **Encaisser**\n2. Recherchez et sélectionnez le **client concerné**\n3. Cliquez sur l'onglet **"Récompenses"** (à côté de "Articles achetés")\n4. Vous verrez les récompenses **disponibles** (en jaune) et celles pas encore accessibles\n5. Cliquez sur **"Utiliser"** sur la récompense souhaitée\n6. Les points sont automatiquement déduits du compte du client\n\n✅ Un écran de confirmation s'affiche avec le nombre de points déduits.\n\n💡 Si aucune récompense n'apparaît en disponible, c'est que le client n'a pas encore assez de points. Son solde s'affiche en haut de l'écran.\n\nQuestions ? **support@fidele-app.fr** 🙏`
  },

  // MON COMPTE
  {
    keywords: ['compte', 'profil', 'modifier', 'nom commerce', 'informations', 'changer nom', 'modifier compte'],
    answer: `Bonjour ! Je vais vous guider pour modifier votre compte. 😊\n\nPour modifier les informations de votre commerce :\n1. Cliquez sur **Mon compte** dans le menu à gauche (sous "Paramètres")\n2. Modifiez les informations souhaitées :\n   • Nom complet\n   • Nom du commerce\n   • Email\n   • Téléphone\n3. Cliquez sur **Sauvegarder**\n\n💡 Le nom de votre commerce apparaît sur la carte de fidélité de vos clients — choisissez un nom clair et reconnaissable !\n\n⚠️ Si vous souhaitez **changer votre email de connexion** ou votre mot de passe, contactez directement notre équipe : **support@fidele-app.fr** — nous traitons ça en priorité. 🙏`
  },

  // DÉCONNEXION
  {
    keywords: ['deconnect', 'déconnect', 'logout', 'sortir', 'quitter', 'mot de passe oublié', 'oublie mot de passe'],
    answer: `Bonjour ! 😊\n\nPour vous **déconnecter** :\n• Cliquez sur la **flèche →** en bas à gauche de la barre latérale, à côté du nom de votre commerce\n• Vous serez redirigé vers la page d'accueil\n\nPour vous **reconnecter** :\n1. Allez sur **fidele-app.vercel.app**\n2. Cliquez sur **Connexion**\n3. Entrez votre email et mot de passe\n\n🔑 **Mot de passe oublié ?**\nContactez notre équipe avec votre email : **support@fidele-app.fr**\nNous vous enverrons un lien de réinitialisation sous 24h. 🙏`
  },

  // BUGS ET PROBLÈMES TECHNIQUES
  {
    keywords: ['bug', 'marche pas', 'fonctionne pas', 'erreur', 'bloque', 'bloqué', 'plante', 'problème technique'],
    answer: `Bonjour ! Nous sommes vraiment désolés que vous rencontriez un problème technique. 🙏\n\nVoici les solutions à essayer dans l'ordre :\n\n**Étape 1 — Actualiser**\n• Tirez la page vers le bas (mobile) ou appuyez sur F5\n\n**Étape 2 — Reconnectez-vous**\n• Déconnectez-vous puis reconnectez-vous\n\n**Étape 3 — Vider le cache**\n• Sur iPhone : Réglages → Safari → Effacer historique\n• Sur Android : Réglages → Applications → Navigateur → Vider cache\n\n**Étape 4 — Changer de navigateur**\n• Essayez Chrome, Safari ou Firefox\n\n💡 Si aucune de ces solutions ne fonctionne, décrivez précisément le problème à notre équipe :\n📧 **support@fidele-app.fr**\n\nPrécisez : ce que vous faisiez, ce qui s'est passé, et si possible une capture d'écran. Nous traitons votre demande sous **24h**. 💙`
  },

  // LENTEUR
  {
    keywords: ['lent', 'chargement', 'long', 'lenteur', 'freeze', 'charge pas'],
    answer: `Bonjour ! Nous sommes désolés pour ce problème de lenteur. 🙏\n\nVoici comment y remédier rapidement :\n\n1. **Vérifiez votre connexion internet** — passez en WiFi si possible\n2. **Actualisez la page** — tirez vers le bas sur mobile\n3. **Videz le cache** de votre navigateur\n4. **Fermez les autres applications** ouvertes en arrière-plan\n5. **Redémarrez votre téléphone** si le problème persiste\n\n💡 FidèleApp fonctionne mieux avec une connexion WiFi ou 4G stable.\n\nSi les lenteurs persistent malgré ces essais, il peut s'agir d'un incident de notre côté. Signalez-le nous immédiatement :\n📧 **support@fidele-app.fr**\nNous vérifions et vous revenons très rapidement. 💙`
  },

  // TARIFS ET ABONNEMENT
  {
    keywords: ['prix', 'abonnement', 'payer', 'tarif', 'facturation', 'combien', 'gratuit', 'beta'],
    answer: `Bonjour ! Merci pour votre question sur les tarifs. 😊\n\nVous bénéficiez actuellement de l'accès **Bêta Gratuit** — toutes les fonctionnalités de FidèleApp sont incluses sans aucun frais !\n\n✅ **Ce qui est inclus en Bêta :**\n• Clients illimités\n• Points et récompenses illimités\n• QR code boutique\n• Tableau de bord complet\n• Support client\n\nLes tarifs définitifs seront communiqués avant la fin de la période Bêta, et vous serez prévenus en avance.\n\nPour toute question sur votre abonnement ou la facturation :\n📧 **support@fidele-app.fr** — nous répondons sous 24h. 🙏`
  },

  // REMERCIEMENTS
  {
    keywords: ['merci', 'super', 'parfait', 'genial', 'génial', 'top', 'bien', 'nickel', 'excellent', 'bravo'],
    answer: `Merci beaucoup pour ce retour, ça nous touche vraiment ! 😊🙏\n\nC'est un plaisir de vous accompagner dans la réussite de votre programme de fidélité.\n\nN'hésitez pas à revenir si vous avez d'autres questions — nous sommes toujours là pour vous aider.\n\nEt si vous avez des suggestions pour améliorer FidèleApp, envoyez-les nous à **support@fidele-app.fr** — votre avis compte beaucoup pour nous ! 💙\n\nBonne journée et bonne fidélisation ! 🚀`
  },

  // COMMENT FONCTIONNE FIDELEAPP
  {
    keywords: ['comment fonctionne', 'comment ca marche', 'comment ça marche', 'expliquer', 'tutoriel', 'aide', 'guide'],
    answer: `Bonjour ! Je vais vous expliquer comment fonctionne FidèleApp en quelques étapes. 😊\n\n**FidèleApp en 4 étapes simples :**\n\n**1. Configurez votre programme** *(5 minutes)*\n→ Allez dans **Système de points** : créez vos articles et récompenses\n\n**2. Affichez votre QR code** *(2 minutes)*\n→ Allez dans **Encaisser** : imprimez votre QR code boutique\n\n**3. Vos clients s'inscrivent** *(30 secondes par client)*\n→ Ils scannent le QR code et créent leur compte\n\n**4. Encaissez et fidélisez** *(quelques secondes)*\n→ À chaque achat, allez dans **Encaisser**, cherchez le client, ajoutez les articles et validez\n\n📊 Suivez votre activité en temps réel sur le **Tableau de bord** !\n\nBesoin d'un accompagnement personnalisé ? Notre équipe est disponible : **support@fidele-app.fr** 🙏`
  },
]

function getAutoReply(message) {
  const msg = message.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  for (const faq of FAQ) {
    if (faq.keywords.some(k =>
      msg.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    )) {
      return faq.answer
    }
  }
  return null
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour et bienvenue sur le support FidèleApp ! 👋😊\n\nJe suis votre assistant et je suis là pour vous aider avec toutes vos questions.\n\nComment puis-je vous aider aujourd\'hui ?' }
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

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const reply = getAutoReply(text)
      if (reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Bonjour ! Merci pour votre message. 😊\n\nJe n'ai pas trouvé de réponse précise à votre demande, mais notre équipe support sera ravie de vous aider personnellement.\n\n📧 **support@fidele-app.fr**\n\nPrécisez votre problème dans l'email et nous vous répondrons sous **24h** avec une solution adaptée.\n\nMerci pour votre confiance en FidèleApp ! 🙏💙`
        }])
      }
      setLoading(false)
    }, 800)
  }

  const suggestions = [
    'Comment ça marche ?',
    'Créditer des points',
    'Ajouter un article',
    'Créer une récompense',
    'Inscrire un client',
    'QR Code boutique',
    'J\'ai un bug',
  ]

  return (
    <div style={{
      position: 'fixed', bottom: 90, right: 24, zIndex: 1000,
      width: 345, height: 540,
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
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Support FidèleApp</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>● En ligne — Répond instantanément</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                maxWidth: '87%', padding: '10px 13px',
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: m.role === 'user' ? '#2563EB' : '#F1F5F9',
                color: m.role === 'user' ? '#fff' : '#1e293b',
                fontSize: 13, lineHeight: 1.65,
              }}
              dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }}
            />
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#F1F5F9', borderRadius: '12px 12px 12px 2px', padding: '10px 16px', fontSize: 20, letterSpacing: 3 }}>
              <span style={{ color: '#94a3b8' }}>···</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions rapides */}
      {messages.length === 1 && (
        <div style={{ padding: '4px 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => setInput(s)}
              style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Bandeau support */}
      <div style={{ padding: '7px 14px', background: '#F8FAFC', borderTop: '1px solid #f0f2f5', fontSize: 11, color: '#64748B', textAlign: 'center' }}>
        Question sans réponse ? 📧 <strong style={{ color: '#2563EB' }}>support@fidele-app.fr</strong>
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #f0f2f5', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
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
            transition: 'background 0.15s',
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
