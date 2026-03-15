import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase.js'
import styles from './ClientSignup.module.css'

export default function ClientSignup() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [commercant, setCommercant] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', tel: '', password: '', accept: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (slug) loadCommercant()
  }, [slug])

  async function loadCommercant() {
    const { data } = await supabase.from('commercants').select('*').eq('slug', slug).single()
    if (data) setCommercant(data)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError('Veuillez remplir votre nom et email.'); return }
    setLoading(true)
    setError('')
    try {
      const { data, error: err } = await supabase.from('clients').insert({
        commercant_id: commercant?.id,
        nom_complet: form.name,
        email: form.email,
        telephone: form.tel,
        points: commercant?.bonus_bienvenue || 100,
        notifications_acceptees: form.accept,
      }).select().single()

      if (err) throw err

      // Enregistrer la transaction bonus bienvenue
      await supabase.from('transactions').insert({
        client_id: data.id,
        commercant_id: commercant?.id,
        points: commercant?.bonus_bienvenue || 100,
        type: 'bonus_bienvenue',
        description: 'Bonus de bienvenue'
      })

      // Stocker l'id du client en session pour la carte
      sessionStorage.setItem('client_id', data.id)
      sessionStorage.setItem('client_data', JSON.stringify(data))
      sessionStorage.setItem('commercant_data', JSON.stringify(commercant))
      navigate('/ma-carte')
    } catch (e) {
      setError("Une erreur est survenue. L'email est peut-être déjà utilisé.")
    } finally {
      setLoading(false)
    }
  }

  const nomCommerce = commercant?.nom_commerce || 'Programme de fidélité'
  const bonus = commercant?.bonus_bienvenue || 100

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.shopLogo}>{nomCommerce[0]}</div>
        <h2 className={styles.shopName}>{nomCommerce}</h2>
        <p className={styles.shopSub}>Rejoignez le programme de fidélité et gagnez des points à chaque visite</p>
      </div>
      <div className={styles.body}>
        <div className={styles.bonusBanner}>🎁 {bonus} points offerts dès votre inscription !</div>
        {error && <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:9,padding:'10px 14px',fontSize:13,color:'#DC2626',fontWeight:600,marginBottom:14}}>{error}</div>}
        <div className={styles.field}><label>Prénom et nom</label><input type="text" placeholder="Marie Dupont" value={form.name} onChange={e=>handle('name',e.target.value)} /></div>
        <div className={styles.field}><label>Email</label><input type="email" placeholder="marie@email.fr" value={form.email} onChange={e=>handle('email',e.target.value)} /></div>
        <div className={styles.field}><label>Téléphone (optionnel)</label><input type="tel" placeholder="06 12 34 56 78" value={form.tel} onChange={e=>handle('tel',e.target.value)} /></div>
        <div className={styles.checkRow}>
          <input type="checkbox" id="accept" checked={form.accept} onChange={e=>handle('accept',e.target.checked)} />
          <label htmlFor="accept">J'accepte de recevoir des notifications de {nomCommerce} concernant mes points et récompenses.</label>
        </div>
        <button className={styles.btnBlue} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Inscription...' : 'Créer mon compte fidélité →'}
        </button>
        <p className={styles.legal}>Programme géré par FidèleApp · Données protégées conformément au RGPD</p>
      </div>
    </div>
  )
}
