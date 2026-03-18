import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'
import styles from './Dashboard.module.css'

const Tip = ({ active, payload, label }) => active && payload?.length ? (
  <div className={styles.tip}>
    <p className={styles.tipLabel}>{label}</p>
    {payload.map(p => <p key={p.name} style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>{p.value}</p>)}
  </div>
) : null

const PERIODS = ['Jour', 'Semaine', 'Mois']

const typeBadgeStyle = (type) => {
  if (type === 'achat') return { background: '#F0FDF4', color: '#16A34A' }
  if (type === 'echange') return { background: '#FEF9C3', color: '#854D0E' }
  if (type === 'bonus_bienvenue') return { background: '#EEF2FF', color: '#4338CA' }
  return { background: '#F0FDF4', color: '#166534' }
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

      const clRecent = cl.filter(c => new Date(c.created_at) >= d30).length
      const clOld = cl.filter(c => new Date(c.created_at) >= d60 && new Date(c.created_at) < d30).length
      const txRecent = tx.filter(t => t.type === 'achat' && new Date(t.created_at) >= d30).length
      const txOld = tx.filter(t => t.type === 'achat' && new Date(t.created_at) >= d60 && new Date(t.created_at) < d30).length
      const ptsRecent = tx.filter(t => t.points > 0 && new Date(t.created_at) >= d30).reduce((s, t) => s + t.points, 0)
      const ptsOld = tx.filter(t => t.points > 0 && new Date(t.created_at) >= d60 && new Date(t.created_at) < d30).reduce((s, t) => s + t.points, 0)
      const rewRecent = tx.filter(t => t.type === 'echange' && new Date(t.created_at) >= d30).length
      const rewOld = tx.filter(t => t.type === 'echange' && new Date(t.created_at) >= d60 && new Date(t.created_at) < d30).length

      setStatsDelta({
        clients: clRecent - clOld,
        achats: txRecent - txOld,
        points: ptsRecent - ptsOld,
        recompenses: rewRecent - rewOld,
      })

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
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
        const months = ['Jan','Fév','Mar','Avr','Mai','Jui','Jul','Aoû','Sep','Oct','Nov','Déc']
        return { label: months[d.getMonth()], start: d, end }
      })
    }

    const courbe = slots.map(slot => {
      const count = clients.filter(c => new Date(c.created_at) < slot.end).length
      return { label: slot.label, clients: count }
    })
    setCourbeData(courbe)

    const moyenne = slots.map(slot => {
      const txSlot = transactions.filter(t => {
        const d = new Date(t.created_at)
        return t.points > 0 && d >= slot.start && d < slot.end
      })
      const clientsActifs = [...new Set(txSlot.map(t => t.client_id))].length
      const totalPts = txSlot.reduce((s, t) => s + t.points, 0)
      const avg = clientsActifs > 0 ? Math.round(totalPts / clientsActifs) : 0
      return { label: slot.label, moyenne: avg }
    })
    setMoyenneData(moyenne)
  }

  const lastAvg = moyenneData[moyenneData.length - 1]?.moyenne ?? 0
  const prevAvg = moyenneData[moyenneData.length - 2]?.moyenne ?? 0
  const avgTrend = lastAvg - prevAvg
  const avgTrendColor = avgTrend >= 0 ? '#16A34A' : '#DC2626'
  const avgTrendBg = avgTrend >= 0 ? '#DCFCE7' : '#FEE2E2'

  const deltaStyle = (v) => ({
    fontSize: 12, fontWeight: 700,
    background: v > 0 ? '#DCFCE7' : v < 0 ? '#FEE2E2' : '#F1F5F9',
    color: v > 0 ? '#16A34A' : v < 0 ? '#DC2626' : '#94A3B8',
    padding: '2px 8px', borderRadius: 999,
  })

  const deltaLabel = (v) => v > 0 ? `+${v} vs M-1` : v < 0 ? `${v} vs M-1` : '= vs M-1'

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <div className={styles.title}>Tableau de bord</div>
          <div className={styles.sub}>Bonjour {commercant?.nom_complet?.split(' ')[0]} — {commercant?.nom_commerce}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={styles.period}
              style={{ background: period === p ? '#2563EB' : undefined, color: period === p ? '#fff' : undefined, borderColor: period === p ? '#2563EB' : undefined }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94A3B8', fontSize: 14 }}>Chargement...</div>
        ) : (
          <>
            <div className={styles.metrics}>
              {[
                { lbl: 'Clients fidèles', val: stats.clients, delta: statsDelta.clients },
                { lbl: 'Achats enregistrés', val: stats.achats, delta: statsDelta.achats },
                { lbl: 'Points distribués', val: stats.points.toLocaleString(), delta: statsDelta.points },
                { lbl: 'Récompenses offertes', val: stats.recompenses, delta: statsDelta.recompenses },
              ].map(m => (
                <div key={m.lbl} className={styles.metric}>
                  <div className={styles.metricLbl}>{m.lbl}</div>
                  <div className={styles.metricVal}>{m.val}</div>
                  <span style={deltaStyle(m.delta)}>{deltaLabel(m.delta)}</span>
                </div>
              ))}
            </div>

            {stats.clients === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Votre programme est prêt !</div>
                <div style={{ fontSize: 14, color: '#64748B', marginBottom: 20, lineHeight: 1.7 }}>
                  Allez dans <strong>Encaisser</strong> pour imprimer votre QR code et accueillir vos premiers clients.
                </div>
                <a href="/dashboard/encaisser" style={{ background: '#2563EB', color: '#fff', padding: '11px 24px', borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  Commencer →
                </a>
              </div>
            ) : (
              <>
                <div className={styles.chartsRow}>
                  <div className={styles.card}>
                    <div className={styles.cardHead}>
                      <div>
                        <div className={styles.cardTitle}>Évolution des clients fidèles</div>
                        <div className={styles.cardSub}>Nombre total cumulé</div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={courbeData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<Tip />} />
                        <Area type="monotone" dataKey="clients" stroke="#2563EB" strokeWidth={2} fill="url(#gBlue)" name="Clients" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={styles.card}>
                    <div className={styles.cardHead}>
                      <div>
                        <div className={styles.cardTitle}>Moyenne pts / client actif</div>
                        <div className={styles.cardSub}>Par {period.toLowerCase()}</div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, background: avgTrendBg, color: avgTrendColor, padding: '3px 10px', borderRadius: 999 }}>
                        {avgTrend >= 0 ? '↑' : '↓'} {Math.abs(avgTrend)} pts
                      </span>
                    </div>
                    {moyenneData.every(d => d.moyenne === 0) ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, fontSize: 13, color: '#CBD5E1' }}>Aucune donnée</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={moyenneData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                          <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<Tip />} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
                          <Bar dataKey="moyenne" fill="#2563EB" radius={[4, 4, 0, 0]} name="Moy. pts" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className={styles.tableCard}>
                  <div className={styles.tableHead}>
                    <span className={styles.cardTitle}>Dernières transactions</span>
                    <span className={styles.cardSub}>{transactions.length} au total</span>
                  </div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Points</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map(t => (
                        <tr key={t.id}>
                          <td>
                            <div className={styles.clientCell}>
                              <div className={styles.av} style={{ background: '#2563EB' }}>
                                {t.clients?.nom_complet?.[0] || '?'}
                              </div>
                              <span className={styles.clientName}>{t.clients?.nom_complet || '—'}</span>
                            </div>
                          </td>
                          <td>{t.description || '—'}</td>
                          <td>
                            <span className={styles.statusBadge} style={typeBadgeStyle(t.type)}>
                              {typeLabel(t.type)}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 13, fontWeight: 700, color: t.points > 0 ? '#16A34A' : '#DC2626' }}>
                              {t.points > 0 ? `+${t.points}` : t.points} pts
                            </span>
                          </td>
                          <td className={styles.muted}>
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
    </div>
  )
}
