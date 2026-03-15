import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function MesClients() {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) loadClients() }, [user])

  async function loadClients() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').eq('commercant_id', user.id).order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  const filtered = clients.filter(c => c.nom_complet?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))

  const s = {
    page: { minHeight: '100vh', background: '#F8FAFF' },
    topbar: { background: '#fff', borderBottom: '1px solid #E8F0FE', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 18, fontWeight: 800, color: '#0F172A' },
    sub: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
    content: { padding: '24px 28px' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 },
    stat: { background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: '16px 18px' },
    statLbl: { fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 },
    statVal: { fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: -1, marginBottom: 4 },
    statChg: { fontSize: 12, fontWeight: 600, background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: 999 },
    searchInput: { width: '100%', maxWidth: 340, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 14px', fontSize: 14, fontFamily: 'inherit', color: '#0F172A', outline: 'none', marginBottom: 16 },
    tableCard: { background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, overflow: 'hidden' },
    tableHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #F1F5F9', fontSize: 14, fontWeight: 700, color: '#0F172A' },
  }

  const totalPts = clients.reduce((s, c) => s + (c.points || 0), 0)
  const avgPts = clients.length > 0 ? Math.round(totalPts / clients.length) : 0

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div><div style={s.title}>Mes clients</div><div style={s.sub}>Gérez et suivez vos clients fidèles</div></div>
      </div>
      <div style={s.content}>
        <div style={s.statsRow}>
          <div style={s.stat}><div style={s.statLbl}>Total clients</div><div style={s.statVal}>{clients.length}</div></div>
          <div style={s.stat}><div style={s.statLbl}>Points totaux distribués</div><div style={s.statVal}>{totalPts.toLocaleString()}</div></div>
          <div style={s.stat}><div style={s.statLbl}>Points moyens / client</div><div style={s.statVal}>{avgPts}</div></div>
        </div>
        <input style={s.searchInput} placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={s.tableCard}>
          <div style={s.tableHead}>
            <span>Clients ({filtered.length})</span>
          </div>
          {loading ? (
            <div style={{textAlign:'center',padding:32,fontSize:13,color:'#94A3B8'}}>Chargement...</div>
          ) : filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:48,fontSize:14,color:'#CBD5E1'}}>
              {clients.length === 0 ? 'Aucun client pour l\'instant — partagez votre QR code !' : 'Aucun résultat'}
            </div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{background:'#FAFAFA',borderBottom:'1px solid #F1F5F9'}}>
                {['Client','Points','Inscrit le'].map(h => <th key={h} style={{textAlign:'left',padding:'10px 16px',fontSize:11,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.06em'}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{borderBottom:'1px solid #F8FAFF'}}>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:'#2563EB',color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{c.nom_complet?.[0]}</div>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:'#0F172A'}}>{c.nom_complet}</div>
                          <div style={{fontSize:11,color:'#94A3B8'}}>{c.email || c.telephone || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:'12px 16px'}}><span style={{background:'#EFF6FF',color:'#2563EB',fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:999}}>{c.points} pts</span></td>
                    <td style={{padding:'12px 16px',fontSize:12,color:'#94A3B8'}}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
