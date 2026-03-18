import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Welcome() {
  const navigate = useNavigate()
  const { user, commercant } = useAuth()
  const [step, setStep] = useState('bienvenue') // bienvenue | points | recompenses | done
  const [bonus, setBonus] = useState(50)
  const [articles, setArticles] = useState([{ id: 1, nom: '', points: '' }])
  const [rewards, setRewards] = useState([{ id: 1, nom: '', points_requis: '' }])
  const [nextId, setNextId] = useState(10)
  const [loading, setLoading] = useState(false)

  const prenom = commercant?.nom_complet?.split(' ')[0] || 'là'
  const nomCommerce = commercant?.nom_commerce || 'votre commerce'

  const updateArticle = (id, f, v) => setArticles(a => a.map(x => x.id === id ? { ...x, [f]: v } : x))
  const addArticle = () => { setArticles(a => [...a, { id: nextId, nom: '', points: '' }]); setNextId(n => n + 1) }
  const delArticle = (id) => setArticles(a => a.filter(x => x.id !== id))

  const updateReward = (id, f, v) => setRewards(r => r.map(x => x.id === id ? { ...x, [f]: v } : x))
  const addReward = () => { setRewards(r => [...r, { id: nextId, nom: '', points_requis: '' }]); setNextId(n => n + 1) }
  const delReward = (id) => setRewards(r => r.filter(x => x.id !== id))

  async function finish() {
    setLoading(true)
    try {
      await supabase.from('commercants').update({ bonus_bienvenue: bonus || 0 }).eq('id', user.id)

      const validArticles = articles.filter(a => a.nom.trim())
      if (validArticles.length > 0) {
        await supabase.from('categories').insert(
          validArticles.map(a => ({
            commercant_id: user.id,
            nom: a.nom,
            points_par_euro: a.points || 0,
            actif: true
          }))
        )
      }

      const validRewards = rewards.filter(r => r.nom.trim())
      if (validRewards.length > 0) {
        await supabase.from('recompenses').insert(
          validRewards.map(r => ({
            commercant_id: user.id,
            nom: r.nom,
            points_requis: r.points_requis || 0
          }))
        )
      }

      navigate('/dashboard')
    } catch (e) {
      console.error(e)
      alert('Erreur lors de la sauvegarde. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const inp = { border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '9px 12px', fontSize: 14, fontFamily: 'inherit', color: '#0F172A', outline: 'none', background: '#fff', width: '100%' }

  // Barre de progression
  const steps = ['bienvenue', 'points', 'recompenses']
  const stepIndex = steps.indexOf(step)

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* TOPBAR */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8F0FE', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" width="14" height="14"><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z" /></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>FidèleApp</span>
        </div>
        {/* Barre de progression */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {['Bienvenue', 'Système de points', 'Récompenses'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < stepIndex ? '#16A34A' : i === stepIndex ? '#2563EB' : '#E2E8F0',
                  color: i <= stepIndex ? '#fff' : '#94A3B8'
                }}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: i === stepIndex ? '#2563EB' : i < stepIndex ? '#16A34A' : '#94A3B8' }}>{label}</span>
              </div>
              {i < 2 && <div style={{ width: 24, height: 2, background: i < stepIndex ? '#16A34A' : '#E2E8F0', borderRadius: 2 }} />}
            </div>
          ))}
        </div>
        <div style={{ width: 100 }} />
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>

        {/* ÉTAPE 1 — BIENVENUE */}
        {step === 'bienvenue' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 10, letterSpacing: -0.5 }}>
                Bienvenue {prenom} !
              </h1>
              <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
                Votre compte <strong>{nomCommerce}</strong> est prêt. Configurons maintenant votre programme de fidélité en 2 étapes rapides.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
              {[
                ['⭐', 'Système de points', 'Définissez combien de points chaque article ou achat rapporte à vos clients.'],
                ['🎁', 'Récompenses', 'Créez les cadeaux que vos clients pourront débloquer avec leurs points.'],
                ['📱', 'C\'est parti !', 'Votre QR code boutique sera prêt à afficher sur votre comptoir.'],
              ].map(([emoji, titre, desc]) => (
                <div key={titre} style={{ background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 3 }}>{titre}</div>
                    <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('points')}
              style={{ width: '100%', background: '#2563EB', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, padding: 14, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Commencer la configuration →
            </button>
          </div>
        )}

        {/* ÉTAPE 2 — SYSTÈME DE POINTS */}
        {step === 'points' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6, letterSpacing: -0.5 }}>Système de points</h2>
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>Combien de points chaque article rapporte à vos clients ? Vous pourrez modifier ça plus tard.</p>
            </div>

            {/* BONUS BIENVENUE */}
            <div style={{ background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Bonus de bienvenue</div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Points offerts automatiquement à chaque nouveau client inscrit</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '10px 14px', width: 'fit-content' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bonus}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9]/g, '')
                    setBonus(v === '' ? '' : +v)
                  }}
                  style={{ border: 'none', background: 'none', fontSize: 22, fontWeight: 800, color: '#0F172A', width: 70, fontFamily: 'inherit', outline: 'none' }}
                />
                <span style={{ fontSize: 13, color: '#94A3B8' }}>points offerts à l'inscription</span>
              </div>
            </div>

            {/* ARTICLES */}
            <div style={{ background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Articles & catégories</div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6, lineHeight: 1.6 }}>Définissez combien de points chaque article rapporte</div>
              <div style={{ fontSize: 12, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '8px 12px', marginBottom: 20, display: 'inline-block' }}>
                Ex : Baguette = 5 pts · Coupe femme = 50 pts · Menu du jour = 30 pts
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 36px', gap: 10, padding: '0 14px', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Article / Catégorie</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Points gagnés</span>
                <span />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {articles.map(a => (
                  <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 36px', gap: 10, alignItems: 'center', background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '11px 14px' }}>
                    <input
                      value={a.nom}
                      onChange={e => updateArticle(a.id, 'nom', e.target.value)}
                      placeholder="Ex : Baguette, Café, Coupe homme..."
                      style={{ border: 'none', background: 'none', fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'inherit', outline: 'none', width: '100%' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 7, padding: '6px 10px' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={a.points}
                        onChange={e => {
                          const v = e.target.value.replace(/[^0-9]/g, '')
                          updateArticle(a.id, 'points', v === '' ? '' : +v)
                        }}
                        placeholder="0"
                        style={{ border: 'none', background: 'none', fontSize: 15, fontWeight: 800, color: '#2563EB', width: 44, fontFamily: 'inherit', outline: 'none' }}
                      />
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>pts</span>
                    </div>
                    <button
                      onClick={() => delArticle(a.id)}
                      style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'none', cursor: 'pointer', color: '#CBD5E1', fontSize: 16, fontWeight: 700 }}
                    >✕</button>
                  </div>
                ))}
              </div>
              <button onClick={addArticle} style={{ width: '100%', marginTop: 10, background: 'none', border: '1.5px dashed #BFDBFE', color: '#2563EB', fontSize: 13, fontWeight: 600, padding: 10, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}>
                + Ajouter un article ou une catégorie
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep('bienvenue')}
                style={{ flex: 1, background: '#F8FAFF', color: '#475569', border: '1.5px solid #E2E8F0', fontSize: 14, fontWeight: 600, padding: 13, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep('recompenses')}
                style={{ flex: 2, background: '#2563EB', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, padding: 13, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Suivant — Récompenses →
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — RÉCOMPENSES */}
        {step === 'recompenses' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6, letterSpacing: -0.5 }}>Récompenses</h2>
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>Qu'est-ce que vos clients obtiennent en échangeant leurs points ? Vous pourrez modifier ça plus tard.</p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 36px', gap: 10, padding: '0 14px', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Récompense</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Points nécessaires</span>
                <span />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rewards.map(r => (
                  <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 36px', gap: 10, alignItems: 'center', background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '11px 14px' }}>
                    <input
                      value={r.nom}
                      onChange={e => updateReward(r.id, 'nom', e.target.value)}
                      placeholder="Ex : Café offert, Remise 5€..."
                      style={{ border: 'none', background: 'none', fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'inherit', outline: 'none', width: '100%' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 7, padding: '6px 10px' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={r.points_requis}
                        onChange={e => {
                          const v = e.target.value.replace(/[^0-9]/g, '')
                          updateReward(r.id, 'points_requis', v === '' ? '' : +v)
                        }}
                        placeholder="0"
                        style={{ border: 'none', background: 'none', fontSize: 15, fontWeight: 800, color: '#2563EB', width: 60, fontFamily: 'inherit', outline: 'none' }}
                      />
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>pts</span>
                    </div>
                    <button
                      onClick={() => delReward(r.id)}
                      style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'none', cursor: 'pointer', color: '#CBD5E1', fontSize: 16, fontWeight: 700 }}
                    >✕</button>
                  </div>
                ))}
              </div>
              <button onClick={addReward} style={{ width: '100%', marginTop: 10, background: 'none', border: '1.5px dashed #BFDBFE', color: '#2563EB', fontSize: 13, fontWeight: 600, padding: 10, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}>
                + Ajouter une récompense
              </button>
            </div>

            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#166534', fontWeight: 500, lineHeight: 1.6 }}>
              💡 Vous pouvez passer cette étape et configurer vos récompenses plus tard depuis le dashboard.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep('points')}
                style={{ flex: 1, background: '#F8FAFF', color: '#475569', border: '1.5px solid #E2E8F0', fontSize: 14, fontWeight: 600, padding: 13, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ← Retour
              </button>
              <button
                onClick={finish}
                disabled={loading}
                style={{ flex: 2, background: '#16A34A', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, padding: 13, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {loading ? 'Sauvegarde...' : '🚀 Accéder à mon dashboard →'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
