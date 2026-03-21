import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'

const card = { background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: '22px 24px' }

export default function SystemePoints() {
  const { user } = useAuth()
  const [articles, setArticles] = useState([])
  const [rewards, setRewards] = useState([])
  const [bonus, setBonus] = useState(50)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [nextId, setNextId] = useState(10)

  useEffect(() => { if (user) loadData() }, [user])

  async function loadData() {
    setDataLoading(true)
    const [catsRes, rewsRes, commRes] = await Promise.all([
      supabase.from('categories').select('*').eq('commercant_id', user.id).order('created_at'),
      supabase.from('recompenses').select('*').eq('commercant_id', user.id).order('points_requis'),
      supabase.from('commercants').select('bonus_bienvenue').eq('id', user.id).single(),
    ])
    setArticles(catsRes.data ? catsRes.data.map(c => ({ id: c.id, nom: c.nom, points: c.points_par_euro, actif: c.actif })) : [])
    setRewards(rewsRes.data ? rewsRes.data.map(r => ({ id: r.id, nom: r.nom, points_requis: r.points_requis })) : [])
    if (commRes.data) setBonus(commRes.data.bonus_bienvenue)
    setDataLoading(false)
  }

  async function save() {
    setLoading(true)
    try {
      await supabase.from('commercants').update({ bonus_bienvenue: bonus || 0 }).eq('id', user.id)

      const validArticles = articles.filter(a => a.nom.trim())
      const existingArtIds = articles.filter(a => typeof a.id === 'string').map(a => a.id)

      const newArts = validArticles.filter(a => typeof a.id !== 'string')
      if (newArts.length > 0) {
        const { error: insErr } = await supabase.from('categories').insert(
          newArts.map(a => ({ commercant_id: user.id, nom: a.nom, points_par_euro: a.points || 0, actif: a.actif }))
        )
        if (insErr) throw insErr
      }
      for (const a of validArticles.filter(a => typeof a.id === 'string')) {
        await supabase.from('categories').update({ nom: a.nom, points_par_euro: a.points || 0, actif: a.actif }).eq('id', a.id)
      }
      const keptArtIds = validArticles.filter(a => typeof a.id === 'string').map(a => a.id)
      const delArtIds = existingArtIds.filter(id => !keptArtIds.includes(id))
      if (delArtIds.length > 0) {
        await supabase.from('categories').delete().in('id', delArtIds)
      }

      const validRews = rewards.filter(r => r.nom.trim())
      const existingRewIds = rewards.filter(r => typeof r.id === 'string').map(r => r.id)

      const newRews = validRews.filter(r => typeof r.id !== 'string')
      if (newRews.length > 0) {
        const { error: insRewErr } = await supabase.from('recompenses').insert(
          newRews.map(r => ({ commercant_id: user.id, nom: r.nom, points_requis: r.points_requis || 0, actif: true }))
        )
        if (insRewErr) throw insRewErr
      }
      for (const r of validRews.filter(r => typeof r.id === 'string')) {
        await supabase.from('recompenses').update({ nom: r.nom, points_requis: r.points_requis || 0 }).eq('id', r.id)
      }
      const keptRewIds = validRews.filter(r => typeof r.id === 'string').map(r => r.id)
      const delRewIds = existingRewIds.filter(id => !keptRewIds.includes(id))
      if (delRewIds.length > 0) {
        await supabase.from('recompenses').delete().in('id', delRewIds)
      }

      await loadData()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      console.error('Erreur sauvegarde:', e.message)
      alert('Erreur lors de la sauvegarde. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const addArticle = () => {
    setArticles(a => [...a, { id: nextId, nom: '', points: '', actif: true }])
    setNextId(n => n + 1)
  }
  const delArticle = (id) => setArticles(a => a.filter(x => x.id !== id))
  const updateArticle = (id, f, v) => setArticles(a => a.map(x => x.id === id ? { ...x, [f]: v } : x))

  const addReward = () => {
    setRewards(r => [...r, { id: nextId, nom: '', points_requis: '' }])
    setNextId(n => n + 1)
  }
  const delReward = (id) => setRewards(r => r.filter(x => x.id !== id))
  const updateReward = (id, f, v) => setRewards(r => r.map(x => x.id === id ? { ...x, [f]: v } : x))

  const firstReward = [...rewards].sort((a, b) => a.points_requis - b.points_requis)[0]

  if (dataLoading) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 14, color: '#94A3B8', fontWeight: 600 }}>Chargement...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF' }}>

      <div style={{ background: '#fff', borderBottom: '1px solid #E8F0FE', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Système de points</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Chaque article a sa propre valeur en points</div>
        </div>
        <button onClick={save} disabled={loading} style={{ background: saved ? '#16A34A' : '#2563EB', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, padding: '9px 22px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? 'Sauvegarde...' : saved ? '✓ Enregistré' : 'Enregistrer'}
        </button>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 860 }}>

        {/* BONUS BIENVENUE */}
        <div style={card}>
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
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Articles & catégories</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6, lineHeight: 1.6 }}>
            Définissez combien de points chaque article ou catégorie rapporte à votre client
          </div>
          <div style={{ fontSize: 12, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '8px 12px', marginBottom: 20, display: 'inline-block' }}>
            Ex : Baguette = 5 pts · Coupe femme = 50 pts · Menu du jour = 30 pts
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 80px 36px', gap: 10, padding: '0 14px', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Article / Catégorie</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Points gagnés</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Actif</span>
            <span />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {articles.length === 0 && (
              <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '16px 0' }}>
                Aucun article encore. Ajoutez-en un ci-dessous.
              </div>
            )}
            {articles.map(a => (
              <div key={a.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 150px 80px 36px', gap: 10, alignItems: 'center',
                background: a.actif ? '#F8FAFF' : '#FAFAFA',
                border: `1.5px solid ${a.actif ? '#E2E8F0' : '#F1F5F9'}`,
                borderRadius: 10, padding: '11px 14px',
                opacity: a.actif ? 1 : 0.55, transition: 'all .15s'
              }}>
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
                  onClick={() => updateArticle(a.id, 'actif', !a.actif)}
                  style={{ width: 38, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', background: a.actif ? '#2563EB' : '#E2E8F0', position: 'relative', padding: 0 }}
                >
                  <span style={{ position: 'absolute', top: 2, left: a.actif ? 18 : 2, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'left .2s', display: 'block' }} />
                </button>
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

        {/* RÉCOMPENSES */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Récompenses</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 1.6 }}>Ce que vos clients obtiennent en échangeant leurs points</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 36px', gap: 10, padding: '0 14px', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Récompense</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Points nécessaires</span>
            <span />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rewards.length === 0 && (
              <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '16px 0' }}>
                Aucune récompense encore. Ajoutez-en une ci-dessous.
              </div>
            )}
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
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>points</span>
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

        {/* APERÇU */}
        <div style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border: '1px solid #BFDBFE', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1D4ED8', marginBottom: 8 }}>Aperçu côté client</div>
            {articles.filter(a => a.actif && a.nom).slice(0, 5).map(a => (
              <div key={a.id} style={{ fontSize: 13, color: '#1E40AF', fontWeight: 500, marginBottom: 3 }}>
                <span style={{ fontWeight: 700 }}>{a.nom}</span> → +{a.points} pts
              </div>
            ))}
            {articles.filter(a => a.actif && a.nom).length === 0 && (
              <div style={{ fontSize: 13, color: '#93C5FD' }}>Ajoutez des articles pour voir l'aperçu</div>
            )}
          </div>
          <div style={{ background: '#2563EB', borderRadius: 12, padding: '16px 20px', color: '#fff', minWidth: 200 }}>
            <div style={{ fontSize: 10, opacity: .7, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Exemple client</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>{bonus || 0} pts</div>
            <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 999, height: 4, marginBottom: 5 }}>
              <div style={{ background: '#fff', borderRadius: 999, height: 4, width: firstReward ? `${Math.min(100, ((bonus || 0) / firstReward.points_requis) * 100)}%` : '0%' }} />
            </div>
            <div style={{ fontSize: 11, opacity: .75 }}>
              {firstReward ? `Encore ${Math.max(0, firstReward.points_requis - (bonus || 0))} pts → ${firstReward.nom}` : '—'}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}


