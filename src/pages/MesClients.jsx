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
  const [sentMessages, setSentMessages] = useState([])
  const [msgTitre, setMsgTitre] = useState('')
  const [msgContenu, setMsgContenu] = useState('')
  const [msgSending, setMsgSending] = useState(false)
  const [msgSuccess, setMsgSuccess] = useState(false)

  useEffect(() => { if (user) { loadClients(); loadMessages() } }, [user])

 async function sendMessage() {
  if (!msgContenu.trim()) return
  setMsgSending(true)
  try {
    const { error } = await supabase.from('messages').insert({
      commercant_id: user.id,
      titre: msgTitre.trim() || null,
      contenu: msgContenu.trim(),
    })
    if (error) throw error

 
  }

  async function sendMessage() {
    if (!msgContenu.trim()) return
    setMsgSending(true)
    try {
      const { error } = await supabase.from('messages').insert({
        commercant_id: user.id,
        titre: msgTitre.trim() || null,
        contenu: msgContenu.trim(),
      })
      if (error) throw error
      setMsgTitre('')
      setMsgContenu('')
      setMsgSuccess(true)
      setTimeout(() => setMsgSuccess(false), 3000)
      loadMessages()
    } catch (e) {
      console.error('Erreur envoi message:', e.message)
      alert('Erreur lors de l\'envoi. Réessayez.')
    } finally {
      setMsgSending(false)
    }
  }

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

      const randomBytes = new Uint8Array(16)
      crypto.getRandomValues(randomBytes)
      const tempPassword = Array.from(randomBytes, b => b.toString(36)).join('').slice(0, 12) + 'A1!'
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: tempPassword,
      })
      if (authError) throw authError

      const { error: createError } = await supabase.rpc('merchant_creer_client', {
        p_client_id:     authData.user.id,
        p_commercant_id: user.id,
        p_nom_complet:   form.nom.trim(),
        p_email:         form.email.trim(),
        p_telephone:     form.telephone.trim(),
      })
      if (createError) throw createError

      await loadClients()
      setSuccess(true)
    } catch (e) {
      console.error('Erreur création client:', e.message)
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

        {/* MESSAGES AUX CLIENTS */}
        <div style={{ background: '#fff', border: '1px solid #E8F0FE', borderRadius: 12, padding: '22px 24px', marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💬</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Message à vos clients</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>Envoyez un message visible sur la carte fidélité de tous vos clients</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
            <div>
              <input
                style={{ ...s.searchInput, maxWidth: '100%', marginBottom: 10, display: 'block' }}
                placeholder="Titre du message (optionnel)"
                value={msgTitre}
                onChange={e => setMsgTitre(e.target.value)}
                maxLength={80}
              />
              <textarea
                style={{ ...s.searchInput, maxWidth: '100%', minHeight: 90, resize: 'vertical', display: 'block', marginBottom: 12, lineHeight: 1.6 }}
                placeholder="Écrivez votre message… promotion, annonce, infos boutique…"
                value={msgContenu}
                onChange={e => setMsgContenu(e.target.value)}
                maxLength={500}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={sendMessage}
                  disabled={!msgContenu.trim() || msgSending}
                  style={{ background: '#2563EB', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', opacity: (!msgContenu.trim() || msgSending) ? 0.5 : 1 }}
                >
                  {msgSending ? 'Envoi…' : 'Envoyer à tous mes clients'}
                </button>
                {msgSuccess && (
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#16A34A' }}>✓ Message envoyé !</div>
                )}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                Messages récents
              </div>
              {sentMessages.length === 0 ? (
                <div style={{ fontSize: 13, color: '#CBD5E1', textAlign: 'center', padding: '16px 0' }}>Aucun message envoyé</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sentMessages.map(m => (
                    <div key={m.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 9, padding: '10px 12px' }}>
                      {m.titre && <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 3 }}>{m.titre}</div>}
                      <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, marginBottom: 5 }}>{m.contenu}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>
                        {new Date(m.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
