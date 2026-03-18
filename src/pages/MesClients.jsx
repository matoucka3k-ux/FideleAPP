import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function MesClients() {
  const { user, commercant } = useAuth()
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nom: '', email: '', telephone: '' })

  useEffect(() => { if (user) loadClients() }, [user])

  async function loadClients() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').eq('commercant_id', user.id).order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openModal = () => {
    setForm({ nom: '', email: '', telephone: '' })
    setError('')
    setSuccess(false)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setError('')
    setSuccess(false)
  }

  async function ajouterClient() {
    if (!form.nom.trim()) { setError('Le nom est obligatoire.'); return }
    if (!form.email.trim()) { setError("L'email est obligatoire."); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) { setError("L'email n'est pas valide."); return }

    setSaving(true)
    setError('')
    try {
      // Vérifie si le client existe déjà
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('email', form.email.trim())
        .eq('commercant_id', user.id)
        .maybeSingle()

      if (existing) {
        setError('Un client avec cet email existe déjà.')
        setSaving(false)
        return
      }

      // Crée un compte auth Supabase avec mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: tempPassword,
      })
      if (authError) throw authError

      // Crée le profil client
      const { error: clientError } = await supabase.from('clients').insert({
        id: authData.user.id,
        commercant_id: user.id,
        nom_complet: form.nom.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim(),
        points: commercant?.bonus_bienvenue || 0,
        notifications_acceptees: false,
      })
      if (clientError) throw clientError

      // Crée l'adhésion
      await supabase.from('adhesions').insert({
        client_id: authData.user.id,
        commercant_id: user.id,
        points: commercant?.bonus_bienvenue || 0,
      })

      // Bonus bienvenue si applicable
      if (commercant?.bonus_bienvenue > 0) {
        await supabase.from('transactions').insert({
          client_id: authData.user.id,
          commercant_id: user.id,
          points: commercant.bonus_bienvenue,
          type: 'bonus_bienvenue',
          description: 'Bonus de bienvenue — ' + commercant.nom_commerce,
        })
      }

      await loadClients()
      setSuccess(true)
    } catch (e) {
      console.error(e)
      setError(e.message || 'Erreur lors de la création. Réessayez.')
    } finally {
      setSaving(false)
    }
  }

  const filtered = clients.filter(c =>
    c.nom_complet?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPts = clients.reduce((s, c) => s + (c.points || 0), 0)
  const avgPts = clients.length > 0 ? Math.round(totalPts / clients.length) : 0

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
    searchInput: { width: '100%', maxWidth: 340, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 14px', fontSize: 14, fontFamily: 'inherit', color: '#0F172A', outline: 'none' },
    tableCard: { background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, overflow: 'hidden' },
    tableHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #F1F5F9', fontSize: 14, fontWeight: 700, color: '#0F172A' },
    // Modal
    overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
    modal: { background: '#fff', borderRadius: 16, padding: '28px 28px 24px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,.15)' },
    label: { fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 },
    inp: { width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '9px 12px', fontSize: 14, fontFamily: 'inherit', color: '#0F172A', outline: 'none', background: '#fff', boxSizing: 'border-box' },
  }

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div>
          <div style={s.title}>Mes clients</div>
          <div style={s.sub}>Gérez et suivez vos clients fidèles</div>
        </div>
        <button
          onClick={openModal}
          style={{ background: '#2563EB', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          + Ajouter un client
        </button>
      </div>

      <div style={s.content}>
        <div style={s.statsRow}>
          <div style={s.stat}><div style={s.statLbl}>Total clients</div><div style={s.statVal}>{clients.length}</div></div>
          <div style={s.stat}><div style={s.statLbl}>Points totaux distribués</div><div style={s.statVal}>{totalPts.toLocaleString()}</div></div>
          <div style={s.stat}><div style={s.statLbl}>Points moyens / client</div><div style={s.statVal}>{avgPts}</div></div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <input style={s.searchInput} placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={s.tableCard}>
          <div style={s.tableHead}>
            <span>Clients ({filtered.length})</span>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, fontSize: 13, color: '#94A3B8' }}>Chargement...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, fontSize: 14, color: '#CBD5E1' }}>
              {clients.length === 0 ? 'Aucun client pour l\'instant — partagez votre QR code !' : 'Aucun résultat'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                  {['Client', 'Points', 'Inscrit le'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F8FAFF' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2563EB', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {c.nom_complet?.[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{c.nom_complet}</div>
                          <div style={{ fontSize: 11, color: '#94A3B8' }}>{c.email || c.telephone || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#EFF6FF', color: '#2563EB', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{c.points} pts</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#94A3B8' }}>
                      {new Date(c.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL AJOUT CLIENT */}
      {showModal && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div style={s.modal}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: 56, height: 56, background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>✓</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Client ajouté !</div>
                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 8, lineHeight: 1.6 }}>
                  <strong>{form.nom}</strong> a été ajouté à votre programme.
                </div>
                {commercant?.bonus_bienvenue > 0 && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#166534', fontWeight: 600, marginBottom: 20 }}>
                    ⭐ {commercant.bonus_bienvenue} points de bienvenue crédités
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => { setSuccess(false); setForm({ nom: '', email: '', telephone: '' }) }}
                    style={{ flex: 1, background: '#EFF6FF', color: '#2563EB', border: 'none', fontSize: 13, fontWeight: 700, padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    + Ajouter un autre
                  </button>
                  <button
                    onClick={closeModal}
                    style={{ flex: 1, background: '#2563EB', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Ajouter un client</div>
                  <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: 20, color: '#94A3B8', cursor: 'pointer', lineHeight: 1 }}>✕</button>
                </div>

                {error && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#DC2626', fontWeight: 600, marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={s.label}>Prénom et nom *</label>
                    <input style={s.inp} placeholder="Marie Dupont" value={form.nom} onChange={e => handle('nom', e.target.value)} />
                  </div>
                  <div>
                    <label style={s.label}>Email *</label>
                    <input style={s.inp} type="email" placeholder="marie@email.fr" value={form.email} onChange={e => handle('email', e.target.value)} />
                  </div>
                  <div>
                    <label style={s.label}>Téléphone (optionnel)</label>
                    <input style={s.inp} type="tel" placeholder="06 12 34 56 78" value={form.telephone} onChange={e => handle('telephone', e.target.value)} />
                  </div>
                </div>

                {commercant?.bonus_bienvenue > 0 && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#166534', fontWeight: 500, marginTop: 16 }}>
                    ⭐ {commercant.bonus_bienvenue} points de bienvenue seront automatiquement crédités
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                  <button
                    onClick={closeModal}
                    style={{ flex: 1, background: '#F8FAFF', color: '#475569', border: '1.5px solid #E2E8F0', fontSize: 13, fontWeight: 600, padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={ajouterClient}
                    disabled={saving}
                    style={{ flex: 2, background: '#2563EB', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {saving ? 'Ajout en cours...' : 'Ajouter le client'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
