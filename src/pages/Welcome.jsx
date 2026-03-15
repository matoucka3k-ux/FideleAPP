import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import styles from './Welcome.module.css'

export default function Welcome() {
  const navigate = useNavigate()
  const { user, commercant, updateCommercant } = useAuth()
  const [rewards, setRewards] = useState([
    { name: 'Café offert', pts: 200 },
    { name: 'Viennoiserie offerte', pts: 500 },
  ])
  const [base, setBase] = useState(1)
  const [bonus, setBonus] = useState(100)
  const [loading, setLoading] = useState(false)
  const [nextId, setNextId] = useState(3)

  const addReward = () => {
    setRewards(r => [...r, { name: '', pts: 1000 }])
    setNextId(n => n + 1)
  }

  const updateReward = (i, field, val) =>
    setRewards(r => r.map((x, idx) => idx === i ? { ...x, [field]: val } : x))

  const handleFinish = async () => {
    setLoading(true)
    try {
      const uid = user?.id
      if (uid) {
        // Sauvegarder les règles de points
        await updateCommercant({ points_par_euro: base, bonus_bienvenue: bonus })

        // Sauvegarder les récompenses
        const validRewards = rewards.filter(r => r.name.trim())
        if (validRewards.length > 0) {
          await supabase.from('recompenses').insert(
            validRewards.map(r => ({ commercant_id: uid, nom: r.name, points_requis: r.pts }))
          )
        }
      }
      navigate('/dashboard')
    } catch (e) {
      console.error(e)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const nomCommerce = commercant?.nom_commerce || 'votre commerce'
  const prenomCommercant = commercant?.nom_complet?.split(' ')[0] || ''

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2"><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
          </div>
          FidèleApp
        </div>
      </nav>
      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.doneBadge}>
            <svg viewBox="0 0 12 12" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M2 6l3 3 5-5"/></svg>
            Compte créé avec succès
          </div>
          <h1 className={styles.title}>
            {prenomCommercant ? `Bienvenue ${prenomCommercant},` : 'Bienvenue,'}<br />
            votre programme est <span>prêt.</span>
          </h1>
          <p className={styles.sub}>
            Plus qu'une étape : configurez vos règles de points. Ça prend 2 minutes — et vous pourrez tout ajuster depuis votre tableau de bord.
          </p>

          <div className={styles.etapes}>
            <div className={styles.etape}>
              <div className={`${styles.eNum} ${styles.eDone}`}>
                <svg viewBox="0 0 12 12" fill="none" stroke="#16A34A" strokeWidth="2.5" style={{width:12,height:12}}><path d="M2 6l3 3 5-5"/></svg>
              </div>
              <div className={styles.eBody}>
                <div className={styles.eLabel}>Compte créé</div>
                <div className={styles.eDesc}>{nomCommerce} · {commercant?.email || ''}</div>
              </div>
              <span className={`${styles.eTag} ${styles.tDone}`}>Fait</span>
            </div>
            <div className={styles.etape}>
              <div className={`${styles.eNum} ${styles.eNow}`}>2</div>
              <div className={styles.eBody}>
                <div className={styles.eLabel}>Configurer vos points</div>
                <div className={styles.eDesc}>Définissez ce que gagnent vos clients à chaque visite</div>
              </div>
              <span className={`${styles.eTag} ${styles.tNow}`}>Maintenant</span>
            </div>
            <div className={styles.etape}>
              <div className={`${styles.eNum} ${styles.eLater}`}>3</div>
              <div className={styles.eBody}>
                <div className={`${styles.eLabel} ${styles.dim}`}>Imprimer votre QR code</div>
                <div className={styles.eDesc}>À poser sur votre comptoir pour les inscriptions</div>
              </div>
              <span className={`${styles.eTag} ${styles.tLater}`}>Plus tard</span>
            </div>
            <div className={styles.etape}>
              <div className={`${styles.eNum} ${styles.eLater}`}>4</div>
              <div className={styles.eBody}>
                <div className={`${styles.eLabel} ${styles.dim}`}>Premier encaissement</div>
                <div className={styles.eDesc}>Scanner le QR code d'un client et créditer ses points</div>
              </div>
              <span className={`${styles.eTag} ${styles.tLater}`}>Plus tard</span>
            </div>
          </div>

          <div className={styles.configCard}>
            <div className={styles.configTitle}>Configuration des points</div>
            <div className={styles.configSub}>Les bases de votre programme — vous pourrez tout affiner dans "Système de points"</div>
            <div className={styles.configGrid}>
              <div>
                <div className={styles.cLabel}>Points par euro dépensé</div>
                <div className={styles.cInput}>
                  <input type="number" value={base} min="1" onChange={e => setBase(+e.target.value)} />
                  <span>pt par €</span>
                </div>
              </div>
              <div>
                <div className={styles.cLabel}>Bonus de bienvenue</div>
                <div className={styles.cInput}>
                  <input type="number" value={bonus} min="0" onChange={e => setBonus(+e.target.value)} />
                  <span>points offerts</span>
                </div>
              </div>
            </div>
            <div className={styles.cLabel}>Récompenses</div>
            <div className={styles.rewardsList}>
              {rewards.map((r, i) => (
                <div key={i} className={styles.rewardRow}>
                  <input type="text" value={r.name} placeholder="Nom de la récompense" onChange={e => updateReward(i, 'name', e.target.value)} />
                  <span className={styles.sep}>à</span>
                  <input type="number" value={r.pts} min="1" onChange={e => updateReward(i, 'pts', +e.target.value)} />
                  <span className={styles.unit}>pts</span>
                </div>
              ))}
            </div>
            <button className={styles.btnAddReward} onClick={addReward}>+ Ajouter une récompense</button>
            <p className={styles.configHint}>Vous pouvez en ajouter autant que vous voulez depuis "Système de points"</p>
          </div>

          <button className={styles.btnBlue} onClick={handleFinish} disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Accéder à mon tableau de bord →'}
          </button>
          <span className={styles.skip} onClick={() => navigate('/dashboard')}>
            Passer cette étape — je configurerai plus tard
          </span>
        </div>
      </div>
    </div>
  )
}
