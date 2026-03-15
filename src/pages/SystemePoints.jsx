import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'

const card = { background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: '22px 24px' }

export default function SystemePoints() {
  const { user } = useAuth()
  const [produits, setProduits] = useState([
    { id: 1, nom: 'Baguette', points: 5, actif: true },
    { id: 2, nom: 'Viennoiserie', points: 10, actif: true },
    { id: 3, nom: 'Pâtisserie', points: 20, actif: true },
  ])
  const [rewards, setRewards] = useState([
    { id: 1, nom: 'Café offert', points_requis: 50 },
    { id: 2, nom: 'Viennoiserie offerte', points_requis: 100 },
    { id: 3, nom: 'Réduction 10%', points_requis: 200 },
  ])
  const [bonus, setBonus] = useState(50)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nextId, setNextId] = useState(10)

  useEffect(() => { if (user) loadData() }, [user])

  async function loadData() {
    const [catsRes, rewsRes, commRes] = await Promise.all([
      supabase.from('categories').select('*').eq('commercant_id', user.id).order('created_at'),
      supabase.from('recompenses').select('*').eq('commercant_id', user.id).order('points_requis'),
      supabase.from('commercants').select('bonus_bienvenue').eq('id', user.id).single(),
    ])
    if (catsRes.data?.length > 0) setProduits(catsRes.data.map(c => ({ id: c.id, nom: c.nom, points: c.points_par_euro, actif: c.actif })))
    if (rewsRes.data?.length > 0) setRewards(rewsRes.data.map(r => ({ id: r.id, nom: r.nom, points_requis: r.points_requis })))
    if (commRes.data) setBonus(commRes.data.bonus_bienvenue)
  }

  const save = async () => {
    setLoading(true)
    try {
      await supabase.from('commercants').update({ bonus_bienvenue: bonus }).eq('id', user.id)
      await supabase.from('categories').delete().eq('commercant_id', user.id)
      const validProduits = produits.filter(p => p.nom.trim())
      if (validProduits.length > 0) {
        await supabase.from('categories').insert(validProduits.map(p => ({ commercant_id: user.id, nom: p.nom, points_par_euro: p.points, actif: p.actif })))
      }
      await supabase.from('recompenses').delete().eq('commercant_id', user.id)
      const validRews = rewards.filter(r => r.nom.trim())
      if (validRews.length > 0) {
        await supabase.from('recompenses').insert(validRews.map(r => ({ commercant_id: user.id, nom: r.nom, points_requis: r.points_requis })))
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const addProduit = () => { setProduits(p => [...p, { id: nextId, nom: '', points: 10, actif: true }]); setNextId(n => n + 1) }
  const delProduit = (id) => setProduits(p => p.filter(x => x.id !== id))
  const updateProduit = (id, f, v) => setProduits(p => p.map(x => x.id === id ? { ...x, [f]: v } : x))
  const addReward = () => { setRewards(r => [...r, { id: nextId, nom: '', points_requis: 100 }]); setNextId(n => n + 1) }
  const delReward = (id) => setRewards(r => r.filter(x => x.id !== id))
  const updateReward = (id, f, v) => setRewards(r => r.map(x => x.id === id ? { ...x, [f]: v } : x))
  const firstReward = [...rewards].sort((a, b) => a.points_requis - b.points_requis)[0]

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E8F0FE', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Système de points</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Définissez vos produits et récompenses</div>
        </div>
        <button onClick={save} disabled={loading} style={{ background: saved ? '#16A34A' : '#2563EB', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, padding: '9px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? 'Sauvegarde...' : saved ? '✓ Enregistré' : 'Enregistrer'}
        </button>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>

        {/* BONUS */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Bonus de bienvenue</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Points offerts automatiquement à chaque nouveau client inscrit</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '10px 14px', width: 'fit-content' }}>
            <input type="number" min="0" value={bonus} onChange={e => setBonus(+e.target.value)} style={{ border: 'none', background: 'none', fontSize: 22, fontWeight: 800, color: '#0F172A', width: 70, fontFamily: 'inherit', outline: 'none' }} />
            <span style={{ fontSize: 13, color: '#94A3B8' }}>points offerts à l'inscription</span>
          </div>
        </div>

        {/* PRODUITS */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Produits & catégories</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6, lineHeight: 1.6 }}>Définissez combien de points chaque produit rapporte à votre client</div>
          <div style={{ fontSize: 12, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '8px 12px', marginBottom: 20, display: 'inline-block' }}>
            Ex : "Baguette = 5 pts", "Menu du jour = 30 pts", "Coupe femme = 50 pts"
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 36px', gap: 10, padding: '0 14px', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Produit / Catégorie</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Points</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Actif</span>
            <span />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {produits.map(p => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 36px', gap: 10, alignItems: 'center', background: p.actif ? '#F8FAFF' : '#FAFAFA', border: `1.5px solid ${p.actif ? '#E2E8F0' : '#F1F5F9'}`, borderRadius: 10, padding: '11px 14px', opacity: p.actif ? 1 : 0.55 }}>
                <input value={p.nom} onChange={e => updateProduit(p.id, 'nom', e.target.value)} placeholder="Ex : Baguette, Menu midi, Coupe..." style={{ border: 'none', background: 'none', fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'inherit', outline: 'none', width: '100%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 7, padding: '6px 10px' }}>
                  <input type="number" min="1" value={p.points} onChange={e => updateProduit(p.id, 'points', +e.target.value)} style={{ border: 'none', background: 'none', fontSize: 15, fontWeight: 800, color: '#2563EB', width: 44, fontFamily: 'inherit', outline: 'none' }} />
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>pts</span>
                </div>
                <button onClick={() => updateProduit(p.id, 'actif', !p.actif)} style={{ width: 38, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', background: p.actif ? '#2563EB' : '#E2E8F0', position: 'relative', padding: 0 }}>
                  <span style={{ position: 'absolute', top: 2, left: p.actif ? 18 : 2, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'left .2s', display: 'block' }} />
                </button>
                <button onClick={() => delProduit(p.id)} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'none', cursor: 'pointer', color: '#CBD5E1', fontSize: 16, fontWeight: 700 }}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={addProduit} style={{ width: '100%', marginTop: 10, background: 'none', border: '1.5px dashed #BFDBFE', color: '#2563EB', fontSize: 13, fontWeight: 600, padding: 10, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}>
            + Ajouter un produit ou une catégorie
          </button>
        </div>

        {/* RÉCOMPENSES */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Récompenses</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 1.6 }}>Ce que vos clients obtiennent en échangeant leurs points</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 170px 36px', gap: 10, padding: '0 14px', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Récompense</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Points nécessaires</span>
            <span />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rewards.map(r => (
              <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 170px 36px', gap: 10, alignItems: 'center', background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '11px 14px' }}>
                <input value={r.nom} onChange={e => updateReward(r.id, 'nom', e.target.value)} placeholder="Ex : Café offert, Remise 5€..." style={{ border: 'none', background: 'none', fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'inherit', outline: 'none', width: '100%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 7, padding: '6px 10px' }}>
                  <input type="number" min="1" value={r.points_requis} onChange={e => updateReward(r.id, 'points_requis', +e.target.value)} style={{ border: 'none', background: 'none', fontSize: 15, fontWeight: 800, color: '#2563EB', width: 60, fontFamily: 'inherit', outline: 'none' }} />
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>points</span>
                </div>
                <button onClick={() => delReward(r.id)} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'none', cursor: 'pointer', color: '#CBD5E1', fontSize: 16, fontWeight: 700 }}>✕</button>
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
            {produits.filter(p => p.actif && p.nom).slice(0, 4).map(p => (
              <div key={p.id} style={{ fontSize: 13, color: '#1E40AF', fontWeight: 500, marginBottom: 3 }}>
                <span style={{ fontWeight: 700 }}>{p.nom}</span> → +{p.points} pts
              </div>
            ))}
          </div>
          <div style={{ background: '#2563EB', borderRadius: 12, padding: '16px 20px', color: '#fff', minWidth: 200 }}>
            <div style={{ fontSize: 10, opacity: .7, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Exemple client</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>{bonus} pts</div>
            <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 999, height: 4, marginBottom: 5 }}>
              <div style={{ background: '#fff', borderRadius: 999, height: 4, width: firstReward ? `${Math.min(100, (bonus / firstReward.points_requis) * 100)}%` : '0%' }} />
            </div>
            <div style={{ fontSize: 11, opacity: .75 }}>
              {firstReward ? `Encore ${Math.max(0, firstReward.points_requis - bonus)} pts → ${firstReward.nom}` : '—'}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
