import { useEffect, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'
import styles from './Dashboard.module.css'

const Tip = ({ active, payload, label }) => active && payload?.length ? (
  <div className={styles.tip}><p className={styles.tipLabel}>{label}</p>{payload.map(p => <p key={p.name} style={{color:p.color,fontSize:13}}>{p.value}</p>)}</div>
) : null

export default function Dashboard() {
  const { user, commercant } = useAuth()
  const [stats, setStats] = useState({ clients: 0, visites: 0, points: 0, recompenses: 0 })
  const [clients, setClients] = useState([])
  const [rewardData, setRewardData] = useState([])
  const [areaData, setAreaData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadData()
  }, [user])

  async function loadData() {
    setLoading(true)
    try {
      const [clientsRes, transactionsRes] = await Promise.all([
        supabase.from('clients').select('*').eq('commercant_id', user.id).order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').eq('commercant_id', user.id).order('created_at', { ascending: true }),
      ])

      const clientsList = clientsRes.data || []
      const txList = transactionsRes.data || []

      const totalPts = txList.filter(t => t.points > 0).reduce((s, t) => s + t.points, 0)
      const exchanges = txList.filter(t => t.type === 'echange').length

      setStats({
        clients: clientsList.length,
        visites: txList.filter(t => t.type === 'achat').length,
        points: totalPts,
        recompenses: exchanges
      })

      setClients(clientsList.slice(0, 5))

      // Graphe récompenses
      const rewCount = {}
      txList.filter(t => t.type === 'echange').forEach(t => {
        const name = t.description || 'Autre'
        rewCount[name] = (rewCount[name] || 0) + 1
      })
      setRewardData(Object.entries(rewCount).map(([name, val]) => ({ name, val })))

      // ✅ Graphe activité — vraies données sur les 8 dernières semaines
      const now = new Date()
      const weeks = Array.from({ length: 8 }, (_, i) => {
        const start = new Date(now)
        start.setDate(now.getDate() - (7 * (7 - i)))
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(start.getDate() + 7)
        const label = `${start.getDate()}/${start.getMonth() + 1}`
        const achats = txList.filter(t => {
          const d = new Date(t.created_at)
          return t.type === 'achat' && d >= start && d < end
        }).length
        const pts = txList.filter(t => {
          const d = new Date(t.created_at)
          return t.points > 0 && d >= start && d < end
        }).reduce((s, t) => s + t.points, 0)
        return { label, achats, pts }
      })
      setAreaData(weeks)

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <div className={styles.title}>Tableau de bord</div>
          <div className={styles.sub}>
            Bonjour {commercant?.nom_complet?.split(' ')[0] || ''} — {commercant?.nom_commerce || ''}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div style={{textAlign:'center',padding:48,color:'#94A3B8',fontSize:14}}>Chargement de vos données...</div>
        ) : (
          <>
            <div className={styles.metrics}>
              {[
                { lbl: 'Clients fidèles', val: stats.clients, chg: 'total' },
                { lbl: 'Achats enregistrés', val: stats.visites, chg: 'total' },
                { lbl: 'Points distribués', val: stats.points.toLocaleString(), chg: 'total' },
                { lbl: 'Récompenses offertes', val: stats.recompenses, chg: 'total' },
              ].map(m => (
                <div key={m.lbl} className={styles.metric}>
                  <div className={styles.metricLbl}>{m.lbl}</div>
                  <div className={styles.metricVal}>{m.val}</div>
                  <span className={styles.metricChg}>{m.chg}</span>
                </div>
              ))}
            </div>

            {stats.clients === 0 ? (
              <div style={{background:'#fff',border:'1px solid #E8F0FE',borderRadius:12,padding:'32px',textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>👋</div>
                <div style={{fontSize:16,fontWeight:700,color:'#0F172A',marginBottom:8}}>Votre programme est prêt !</div>
                <div style={{fontSize:14,color:'#64748B',marginBottom:20,lineHeight:1.7}}>
                  Allez dans <strong>Encaisser</strong> pour imprimer votre QR code et commencer à accueillir vos premiers clients fidèles.
                </div>
                <a href="/dashboard/encaisser" style={{background:'#2563EB',color:'#fff',padding:'11px 24px',borderRadius:9,fontSize:14,fontWeight:700,textDecoration:'none'}}>
                  Commencer →
                </a>
              </div>
            ) : (
              <>
                <div className={styles.chartsRow}>
                  <div className={styles.card}>
                    <div className={styles.cardHead}>
                      <div className={styles.cardTitle}>Achats — 8 dernières semaines</div>
                    </div>
                    {areaData.every(d => d.achats === 0) ? (
                      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:180,fontSize:13,color:'#CBD5E1'}}>Aucun achat enregistré pour l'instant</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={areaData} margin={{top:5,right:0,left:-20,bottom:0}}>
                          <defs>
                            <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="label" tick={{fill:'#94A3B8',fontSize:11}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fill:'#94A3B8',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<Tip />} />
                          <Area type="monotone" dataKey="achats" stroke="#2563EB" strokeWidth={2} fill="url(#gBlue)" name="Achats" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className={styles.card}>
                    <div className={styles.cardHead}>
                      <div className={styles.cardTitle}>Récompenses échangées</div>
                    </div>
                    {rewardData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={rewardData} margin={{top:5,right:0,left:-20,bottom:0}}>
                          <XAxis dataKey="name" tick={{fill:'#94A3B8',fontSize:11}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fill:'#94A3B8',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<Tip />} cursor={{fill:'rgba(37,99,235,0.04)'}} />
                          <Bar dataKey="val" fill="#2563EB" radius={[4,4,0,0]} name="Échanges" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:180,fontSize:13,color:'#CBD5E1'}}>Aucun échange pour l'instant</div>
                    )}
                  </div>
                </div>

                <div className={styles.tableCard}>
                  <div className={styles.tableHead}><span className={styles.cardTitle}>Derniers clients</span></div>
                  <table className={styles.table}>
                    <thead><tr><th>Client</th><th>Points</th><th>Inscrit le</th></tr></thead>
                    <tbody>
                      {clients.map(c => (
                        <tr key={c.id}>
                          <td>
                            <div className={styles.clientCell}>
                              <div className={styles.av} style={{background:'#2563EB'}}>{c.nom_complet?.[0] || '?'}</div>
                              <div>
                                <div className={styles.clientName}>{c.nom_complet}</div>
                                <div style={{fontSize:11,color:'#94A3B8'}}>{c.email || c.telephone || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={styles.ptsBadge}>{c.points} pts</span></td>
                          <td className={styles.muted}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
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
