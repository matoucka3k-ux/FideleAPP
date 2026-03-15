import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import styles from './Signup.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { setError('Remplissez tous les champs.'); return }
    setLoading(true)
    setError('')
    try {
      await signIn({ email, password })
      navigate('/dashboard')
    } catch (e) {
      setError('Email ou mot de passe incorrect.')
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
        <button className={styles.navLink} onClick={() => navigate('/inscription')}>Créer un compte</button>
      </nav>
      <div className={styles.center}>
        <div className={styles.card}>
          <h1 className={styles.title}>Connexion</h1>
          <p className={styles.sub}>Accédez à votre tableau de bord.</p>
          {error && <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:9,padding:'10px 14px',fontSize:13,color:'#DC2626',fontWeight:600,marginBottom:16}}>{error}</div>}
          <div className={styles.field}><label>Email</label><input type="email" placeholder="pierre@boulangerieMartin.fr" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className={styles.field}><label>Mot de passe</label><input type="password" placeholder="Votre mot de passe" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} /></div>
          <button className={styles.btnBlue} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
          <p className={styles.note}><span className={styles.link}>Mot de passe oublié ?</span></p>
          <div className={styles.divider}><span className={styles.divLine}/><span className={styles.divText}>pas encore de compte ?</span><span className={styles.divLine}/></div>
          <button className={styles.btnOutline} onClick={() => navigate('/inscription')}>Créer mon compte bêta gratuit</button>
        </div>
      </div>
    </div>
  )
}
