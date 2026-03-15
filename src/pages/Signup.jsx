import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import styles from './Signup.module.css'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form, setForm] = useState({ name: '', commerce: '', type: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.commerce || !form.email || !form.password) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await signUp({
        nomComplet: form.name,
        nomCommerce: form.commerce,
        typeCommerce: form.type,
        email: form.email,
        password: form.password
      })
      navigate('/bienvenue')
    } catch (e) {
      setError(e.message || 'Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2"><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
          </div>
          FidèleApp
        </div>
        <button className={styles.navLink} onClick={() => navigate('/connexion')}>Déjà un compte ? Se connecter</button>
      </nav>
      <div className={styles.center}>
        <div className={styles.card}>
          <div className={styles.betaPill}><span className={styles.betaDot} />Accès bêta gratuit</div>
          <h1 className={styles.title}>Créez votre compte</h1>
          <p className={styles.sub}>Rejoignez nos premiers testeurs. Accès complet et gratuit, sans carte bancaire.</p>
          {error && <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:9,padding:'10px 14px',fontSize:13,color:'#DC2626',fontWeight:600,marginBottom:16}}>{error}</div>}
          <div className={styles.field}><label>Prénom et nom</label><input type="text" placeholder="Pierre Martin" value={form.name} onChange={e => handle('name', e.target.value)} /></div>
          <div className={styles.field}><label>Nom de votre commerce</label><input type="text" placeholder="Boulangerie Martin" value={form.commerce} onChange={e => handle('commerce', e.target.value)} /></div>
          <div className={styles.field}><label>Type de commerce</label>
            <select value={form.type} onChange={e => handle('type', e.target.value)}>
              <option value="" disabled>Choisissez votre activité...</option>
              <option>Boulangerie / Pâtisserie</option>
              <option>Coiffeur / Barbier</option>
              <option>Restaurant / Café</option>
              <option>Institut beauté / Spa</option>
              <option>Boutique mode / Prêt-à-porter</option>
              <option>Épicerie / Bio</option>
              <option>Autre</option>
            </select>
          </div>
          <div className={styles.field}><label>Email</label><input type="email" placeholder="pierre@boulangerieMartin.fr" value={form.email} onChange={e => handle('email', e.target.value)} /></div>
          <div className={styles.field}><label>Mot de passe</label><input type="password" placeholder="8 caractères minimum" value={form.password} onChange={e => handle('password', e.target.value)} /></div>
          <button className={styles.btnBlue} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Création du compte...' : 'Créer mon compte →'}
          </button>
          <p className={styles.note}>En créant un compte, vous acceptez nos <span className={styles.link}>CGU</span> et notre <span className={styles.link}>politique de confidentialité</span>.</p>
          <div className={styles.divider}><span className={styles.divLine}/><span className={styles.divText}>déjà inscrit ?</span><span className={styles.divLine}/></div>
          <button className={styles.btnOutline} onClick={() => navigate('/connexion')}>Se connecter</button>
        </div>
      </div>
    </div>
  )
}
