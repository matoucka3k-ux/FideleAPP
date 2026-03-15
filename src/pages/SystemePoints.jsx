import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'

const initCats = [
  { id: 1, name: 'Pains & baguettes', pts: 1, active: true },
  { id: 2, name: 'Viennoiseries', pts: 2, active: true },
  { id: 3, name: 'Pâtisseries', pts: 3, active: false },
]

const initRewards = [
  { id: 1, name: 'Café offert', pts: 200 },
  { id: 2, name: 'Viennoiserie', pts: 500 },
  { id: 3, name: 'Réduction 10%', pts: 1000 },
]

const card = { background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: '22px 24px' }
const field = { display: 'flex', flexDirection: 'column', gap: 6 }
const label = { fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.04em' }
const inputStyle = { border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '10px 14px', fontSize: 18, fontWeight: 800, color: '#0F172A', width: 80, fontFamily: 'inherit', outline: 'none' }

export default function SystemePoints() {
  const [cats, setCats] = useState(initCats)
  const [rewards, setRewards] = useState(initRewards)
  const [base, setBase] = useState(1)
  const [bonus, setBonus] = useState(100)
  const [saved, setSaved] = useState(false)
  const [nextId, setNextId] = useState(10)

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const addCat = () => { setCats(c => [...c, { id: nextId, name: '', pts: 1, active: true }]); setNextId(n => n + 1) }
  const delCat = (id) => setCats(c => c.filter(x => x.id !== id))
  const updateCat = (id, field, val) => setCats(c => c.map(x => x.id === id ? { ...x, [field]: val } : x))

  const addReward = () => { setRewards(r => [...r, { id: nextId, name: '', pts: 500 }]); setNextId(n => n + 1) }
  const delReward = (id) => setRewards(r => r.filter(x => x.id !== id))
  const updateReward = (id, field, val) => setRewards(r => r.map(x => x.id === id ? { ...x, [field]: val } : x))

  const firstReward = [...rewards].sort((a, b) => a.pts - b.pts)[0]

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E8F0FE', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Système de points</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Définissez vos règles de points et récompenses</div>
        </div>
        <button onClick={save} style={{ background: saved ? '#16A34A' : '#2563EB', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, padding: '9px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
          {saved ? '✓ Enregistré' : 'Enregistrer'}
        </button>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>

        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Règle de base</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Points accordés par défaut pour chaque euro dépensé</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={field}><label style={label}>Points par euro dépensé</label><div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '10px 14px' }}><input type="number" min="1" value={base} onChange={e => setBase(+e.target.value)} style={{ ...inputStyle, border: 'none', background: 'none', padding: 0 }} /><span style={{ fontSize: 13, color: '#94A3B8' }}>point(s) par €</span></div></div>
            <div style={field}><label style={label}>Bonus de bienvenue</label><div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '10px 14px' }}><input type="number" min="0" value={bonus} onChange={e => setBonus(+e.target.value)} style={{ ...inputStyle, border: 'none', background: 'none', padding: 0 }} /><span style={{ fontSize: 13, color: '#94A3B8' }}>points offerts</span></div></div>
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Points par catégorie</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Multipliez les points sur certaines catégories pour booster les ventes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cats.map(cat => (
              <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 100px 36px', gap: 10, alignItems: 'center', background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '12px 14px' }}>
                <input value={cat.name} onChange={e => updateCat(cat.id, 'name', e.target.value)} placeholder="Nom de la catégorie" style={{ border: 'none', background: 'none', fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'inherit', outline: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 7, padding: '7px 10px' }}>
                  <input type="number" min="1" max="10" value={cat.pts} onChange={e => updateCat(cat.id, 'pts', +e.target.value)} style={{ border: 'none', background: 'none', fontSize: 14, fontWeight: 700, color: '#2563EB', width: 36, fontFamily: 'inherit', outline: 'none' }} />
                  <span style={{ fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>pts par €</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>Actif</span>
                  <button onClick={() => updateCat(cat.id, 'active', !cat.active)} style={{ width: 36, height: 20, borderRadius: 999, border: 'none', cursor: 'pointer', background: cat.active ? '#2563EB' : '#E2E8F0', position: 'relative', flexShrink: 0 }}>
                    <span style={{ position: 'absolute', top: 2, left: cat.active ? 18 : 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left .2s' }} />
                  </button>
                </div>
                <button onClick={() => delCat(cat.id)} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626', fontSize: 14, fontWeight: 700 }}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={addCat} style={{ width: '100%', marginTop: 10, background: 'none', border: '1.5px dashed #BFDBFE', color: '#2563EB', fontSize: 13, fontWeight: 600, padding: 10, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter une catégorie</button>
        </div>

        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Récompenses</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Ce que vos clients peuvent obtenir en échangeant leurs points</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {rewards.map(r => (
              <div key={r.id} style={{ background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: 16, position: 'relative' }}>
                <button onClick={() => delReward(r.id)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: 13, fontWeight: 700 }}>✕</button>
                <div style={{ width: 40, height: 40, background: '#EFF6FF', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 18 }}>🎁</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Nom</div>
                <input value={r.name} onChange={e => updateReward(r.id, 'name', e.target.value)} placeholder="Ex : Café offert" style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 7, padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', color: '#0F172A', outline: 'none', marginBottom: 10 }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Points nécessaires</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #E2E8F0', borderRadius: 7, padding: '7px 10px', background: '#fff' }}>
                  <input type="number" value={r.pts} onChange={e => updateReward(r.id, 'pts', +e.target.value)} style={{ border: 'none', background: 'none', fontSize: 14, fontWeight: 800, color: '#2563EB', width: 60, fontFamily: 'inherit', outline: 'none' }} />
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>points</span>
                </div>
              </div>
            ))}
            <div onClick={addReward} style={{ background: 'none', border: '1.5px dashed #BFDBFE', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 160 }}>
              <span style={{ fontSize: 24, color: '#BFDBFE' }}>+</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#CBD5E1' }}>Ajouter une récompense</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border: '1px solid #BFDBFE', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1D4ED8', marginBottom: 4 }}>Aperçu côté client</div>
            <div style={{ fontSize: 13, color: '#3B82F6', marginBottom: 8 }}>{base} point{base > 1 ? 's' : ''} par euro · Bonus bienvenue : {bonus} pts</div>
            {[...rewards].sort((a, b) => a.pts - b.pts).slice(0, 3).map(r => (
              <div key={r.id} style={{ fontSize: 12, fontWeight: 600, color: '#1D4ED8', marginBottom: 3 }}>{r.name || 'Récompense'} — {r.pts} pts</div>
            ))}
          </div>
          <div style={{ background: '#2563EB', borderRadius: 10, padding: '14px 18px', color: '#fff', minWidth: 200 }}>
            <div style={{ fontSize: 10, opacity: .7, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Vos points</div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>{bonus}</div>
            <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 999, height: 4, marginBottom: 4 }}><div style={{ background: '#fff', borderRadius: 999, height: 4, width: firstReward ? `${Math.min(100, (bonus / firstReward.pts) * 100)}%` : '0%' }} /></div>
            <div style={{ fontSize: 10, opacity: .75 }}>{firstReward ? `Encore ${Math.max(0, firstReward.pts - bonus)} pts → ${firstReward.name || 'première récompense'}` : '—'}</div>
          </div>
        </div>

      </div>
    </div>
  )
}
