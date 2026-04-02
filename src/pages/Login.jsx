import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

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

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
    padding: '11px 14px', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', color: '#e8e8f0',
    transition: 'border-color .2s',
  }

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 500,
    color: 'rgba(255,255,255,0.5)', marginBottom: 7, letterSpacing: '-0.01em',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Inter', -apple-system, sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Glow */}
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" style={{ width: 12, height: 12 }}><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>FidèleApp</span>
        </div>
        <button onClick={() => navigate('/inscription')}
          style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'color .2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          Créer un compte
        </button>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '36px 32px' }}>

            {/* Icon */}
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8, textAlign: 'center' }}>Connexion</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: 28 }}>
              Accédez à votre tableau de bord.
            </p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#f87171', fontWeight: 500, marginBottom: 18 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" placeholder="pierre@boulangerieMartin.fr" value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Mot de passe</label>
              <input type="password" placeholder="Votre mot de passe" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: 22 }}>
              <span style={{ fontSize: 12.5, color: 'rgba(99,102,241,0.7)', cursor: 'pointer', transition: 'color .2s' }}
                onMouseEnter={e => e.target.style.color = '#818cf8'}
                onMouseLeave={e => e.target.style.color = 'rgba(99,102,241,0.7)'}
              >
                Mot de passe oublié ?
              </span>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, padding: '13px 0', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1, letterSpacing: '-0.01em', transition: 'opacity .2s' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={e => e.currentTarget.style.opacity = loading ? '0.7' : '1'}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>pas encore de compte ?</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <button onClick={() => navigate('/inscription')}
              style={{ width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14, fontWeight: 500, padding: '12px 0', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              Créer mon compte bêta gratuit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
