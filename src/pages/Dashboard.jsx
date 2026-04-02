import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'

const Tip = ({ active, payload, label }) => active && payload?.length ? (
  <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</p>
    {payload.map(p => <p key={p.name} style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>{p.value}</p>)}
  </div>
) : null

const PERIODS = ['Jour', 'Semaine', 'Mois']

const typeBadgeStyle = (type) => {
  if (type === 'achat') return { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }
  if (type === 'echange') return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }
  if (type === 'bonus_bienvenue') return { background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }
  return { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }
}

const typeLabel = (type) => {
  if (type === 'achat') return 'Achat'
  if (type === 'echange') return 'Échange'
  if (type === 'bonus_bienvenue') return 'Bonus bienvenue'
  return type
}

export default function Dashboard() {
  const { user, commercant } = useAuth()
  const [stats, setStats] = useState({ clients: 0, achats: 0, points: 0, recompenses: 0 })
  const [statsDelta, setStatsDelta] = useState({ clients: 0, achats: 0, points: 0, recompenses: 0 })
  const [transactions, setTransactions] = useState([])
  const [clients, setClients] = useState([])
  const [courbeData, setCourbeData] = useState([])
  const [moyenneData, setMoyenneData] = useState([])
  const [period, setPeriod] = useState('Semaine')
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) loadData() }, [user])
  useEffect(() => { if (clients.length || transactions.length) buildCharts() }, [period, clients, transactions])

  async function loadData() {
    setLoading(true)
    try {
      const [clientsRes, txRes] = await Promise.all([
        supabase.from('clients').select('*').eq('commercant_id', user.id).order('created_at', { ascending: true }),
        supabase.from('transactions').select('*, clients(nom_complet)').eq('commercant_id', user.id).order('created_at', { ascending: false }),
      ])
      const cl = clientsRes.data || []
      const tx = txRes.data || []
      setClients(cl)
      setTransactions(tx)
      const totalPts = tx.filter(t => t.points > 0).reduce((s, t) => s + t.points, 0)
      const exchanges = tx.filter(t => t.type === 'echange').length
      const achats = tx.filter(t => t.type === 'achat').length
      setStats({ clients: cl.length, achats, points: totalPts, recompenses: exchanges })
      const now = new Date()
      const d30 = new Date(now); d30.setDate(now.getDate() - 30)
      const d60 = new Date(now); d60.setDate(now.getDate() - 60)
      setStatsDelta({
        clients: cl.filter(c => new Date(c.created_at) >= d30).length - cl.filter(c => new Date(c.created_at) >= d60 && new Date(c.created_at) < d30).length,
        achats: tx.filter(t => t.type === 'achat' && new Date(t.created_at) >= d30).length - tx.filter(t => t.type === 'achat' && new Date(t.created_at) >= d60 && new Date(t.created_at) < d30).length,
        points: tx.filter(t => t.points > 0 && new Date(t.created_at) >= d30).reduce((s, t) => s + t.points, 0) - tx.filter(t => t.points > 0 && new Date(t.created_at) >= d60 && new Date(t.created_at) < d30).reduce((s, t) => s + t.points, 0),
        recompenses: tx.filter(t => t.type === 'echange' && new Date(t.created_at) >= d30).length - tx.filter(t => t.type === 'echange' && new Date(t.created_at) >= d60 && new Date(t.created_at) < d30).length,
      })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function buildCharts() {
    const now = new Date()
    let slots = []
    if (period === 'Jour') {
      slots = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(now); d.setDate(now.getDate() - (13 - i)); d.setHours(0,0,0,0)
        const end = new Date(d); end.setDate(d.getDate() + 1)
        return { label: `${d.getDate()}/${d.getMonth()+1}`, start: d, end }
      })
    } else if (period === 'Semaine') {
      slots = Array.from({ length: 8 }, (_, i) => {
        const start = new Date(now); start.setDate(now.getDate() - (7 * (7 - i))); start.setHours(0,0,0,0)
        const end = new Date(start); end.setDate(start.getDate() + 7)
        return { label: `${start.getDate()}/${start.getMonth()+1}`, start, end }
      })
    } else {
      slots = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1)
        return { label: ['Jan','Fév','Mar','Avr','Mai','Jui','Jul','Aoû','Sep','Oct','Nov','Déc'][d.getMonth()], start: d, end }
      })
    }
    setCourbeData(slots.map(s => ({ label: s.label, clients: clients.filter(c => new Date(c.created_at) < s.end).length })))
    setMoyenneData(slots.map(s => {
      const txSlot = transactions.filter(t => { const d = new Date(t.created_at); return t.points > 0 && d >= s.start && d < s.end })
      const actifs = [...new Set(txSlot.map(t => t.client_id))].length
      return { label: s.label, moyenne: actifs > 0 ? Math.round(txSlot.reduce((acc, t) => acc + t.points, 0) / actifs) : 0 }
    }))
  }

  const lastAvg = moyenneData[moyenneData.length - 1]?.moyenne ?? 0
  const prevAvg = moyenneData[moyenneData.length - 2]?.moyenne ?? 0
  const avgTrend = lastAvg - prevAvg

  const deltaLabel = (v) => v > 0 ? `+${v} vs M-1` : v < 0 ? `${v} vs M-1` : '= vs M-1'
  const deltaColor = (v) => v > 0 ? '#22c55e' : v < 0 ? '#ef4444' : 'rgba(255,255,255,0.3)'
  const deltaBg = (v) => v > 0 ? 'rgba(34,197,94,0.1)' : v < 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)'
  const deltaBorder = (v) => v > 0 ? 'rgba(34,197,94,0.2)' : v < 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: '#0d0d14', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>Tableau de bord</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Bonjour {commercant?.nom_complet?.split(' ')[0]} — {commercant?.nom_commerce}</div>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 3 }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', background: period === p ? 'rgba(99,102,241,0.25)' : 'transparent', color: period === p ? '#818cf8' : 'rgba(255,255,255,0.35)' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>Chargement...</div>
      ) : (
        <>
          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { lbl: 'Clients fidèles', val: stats.clients, delta: statsDelta.clients },
              { lbl: 'Achats enregistrés', val: stats.achats, delta: statsDelta.achats },
              { lbl: 'Points distribués', val: stats.points.toLocaleString(), delta: statsDelta.points },
              { lbl: 'Récompenses offertes', val: stats.recompenses, delta: statsDelta.recompenses },
            ].map(m => (
              <div key={m.lbl} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{m.lbl}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>{m.val}</div>
                <span style={{ fontSize: 11.5, fontWeight: 600, background: deltaBg(m.delta), color: deltaColor(m.delta), border: `1px solid ${deltaBorder(m.delta)}`, padding: '2px 9px', borderRadius: 20 }}>
                  {deltaLabel(m.delta)}
                </span>
              </div>
            ))}
          </div>

          {stats.clients === 0 ? (
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="#818cf8" strokeWidth="1.8" style={{ width: 22, height: 22 }}><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>Votre programme est prêt</div>
              <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', marginBottom: 24, lineHeight: 1.7 }}>
                Allez dans <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Encaisser</strong> pour imprimer votre QR code et accueillir vos premiers clients.
              </div>
              <a href="/dashboard/encaisser" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '11px 28px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                Commencer
              </a>
            </div>
          ) : (
            <>
              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em', marginBottom: 4 }}>Évolution des clients fidèles</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>Nombre total cumulé</div>
                  <ResponsiveContainer width="100%" height={170}>
                    <AreaChart data={courbeData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10.5 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10.5 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                      <Tooltip content={<Tip />}/>
                      <Area type="monotone" dataKey="clients" stroke="#6366f1" strokeWidth={2} fill="url(#gBlue)" name="Clients"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>Moyenne pts / client actif</div>
                    <span style={{ fontSize: 12, fontWeight: 600, background: avgTrend >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: avgTrend >= 0 ? '#22c55e' : '#ef4444', border: `1px solid ${avgTrend >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, padding: '2px 9px', borderRadius: 20 }}>
                      {avgTrend >= 0 ? '↑' : '↓'} {Math.abs(avgTrend)} pts
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>Par {period.toLowerCase()}</div>
                  {moyenneData.every(d => d.moyenne === 0) ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 170, fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>Aucune donnée</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={170}>
                      <BarChart data={moyenneData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10.5 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10.5 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                        <Tooltip content={<Tip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }}/>
                        <Bar dataKey="moyenne" fill="url(#barGrad)" radius={[4, 4, 0, 0]} name="Moy. pts">
                          <defs>
                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#818cf8"/>
                              <stop offset="100%" stopColor="#6366f1"/>
                            </linearGradient>
                          </defs>
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Transactions table */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>Dernières transactions</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{transactions.length} au total</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {['Client', 'Description', 'Type', 'Points', 'Date'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, flexShrink: 0 }}>
                              {t.clients?.nom_complet?.[0] || '?'}
                            </div>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{t.clients?.nom_complet || '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>{t.description || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, ...typeBadgeStyle(t.type) }}>
                            {typeLabel(t.type)}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: t.points > 0 ? '#22c55e' : '#ef4444' }}>
                            {t.points > 0 ? `+${t.points}` : t.points} pts
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
                          {new Date(t.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
